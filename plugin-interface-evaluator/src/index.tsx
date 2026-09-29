import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
export { default as AnnotateWrapper } from "./components/utils/AnnotateWrapper";
import styles from "./index.css";

import { version } from "../package.json";
import { createRoot } from "react-dom/client"
import App, {FinishData} from "./App";
import { ReactElement } from "react";
import { ComponentItem } from "./components/component-library";
import { Heuristic, SeverityScale } from "./lib/types";
import type { UiLabels } from "./lib/labels";

/*
 * Makes a page stylesheet work inside the plugin's shadow root (`theme` param)
 * 1. ":root" never matches inside a shadow tree, so it is widened to ":host"
 *    (otherwise color tokens are missing while layout still works)
 * 2. Unlayered rules always beat layered ones. The plugin's Tailwind @theme tokens
 *    are unlayered, page tokens usually sit in "@layer base", so the page's
 *    ":root" declarations are reapplied unlayered in a final ":host{}" block
 */
function makeThemeCssShadowSafe(css: string): string {
  const widened = css.replace(/:root(?![-\w])/g, ":root, :host");
  const rootDeclarations = [...css.matchAll(/:root\s*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .join("");
  const unlayeredOverride = rootDeclarations ? `\n:host{${rootDeclarations}}` : "";
  return widened + unlayeredOverride;
}

/*
 * @font-face and @property are ignored inside a shadow root, so they are copied once into <head>
 * Tailwind v4 needs @property for its --tw-* defaults, without them borders, shadows and transforms break
 * Everything else stays scoped
 */
function hoistDocumentRules(id: string, css: string) {
  const rules = css.match(/@(?:font-face|property\s+--[\w-]+)\s*\{[^}]*\}/g);
  if (!rules || document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = rules.join("\n");
  document.head.appendChild(el);
}

const info = {
  name: "plugin-interface-evaluator",
  version: version,
  parameters: {
    /**
     * Components shown in the sidebar (Interface Building only)
     * Accepts library IDs like ["button-primary", "input"], custom ComponentItem objects or a mix of both
     * Defaults to all library components
     */
    components: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /**
     * Plugin mode
     * "Annotation": participants annotate a fixed interface
     * "Interface Building": participants build an interface from components on a canvas
     */
    outputType: {
      type: ParameterType.SELECT,
      options: ["Annotation", "Interface Building"],
      default: "Annotation"
    },
    /**
     * HTML of the interface to annotate, or an array with one HTML string per screen (Annotation only)
     * Screens are switched via tabs and their annotation ids get a "s<n>:" prefix
     * Clicking any element opens the annotation dialog
     */
    interface: {
      type: ParameterType.COMPLEX,
      default: null
    },
    /**
     * Optional severity rating in the annotation dialog (Annotation only)
     * e.g. { title: "Severity", options: [{ value: 0, label: "..." }, ...] }
     * If set, a value is required and stored as `severity` on the annotation and the annotate event
     */
    severity_scale: {
      type: ParameterType.OBJECT,
      default: null
    },
    /** Optional tab labels for a multi screen `interface`, same order */
    interface_labels: {
      type: ParameterType.STRING,
      array: true,
      default: []
    },
    /**
     * Saves a base64 JPEG of the canvas at trial end
     * Increases data size a lot, only enable when needed
     */
    screenshot: {
      type: ParameterType.BOOL,
      default: false
    },
    /**
     * Optional heuristics shown in a sidebar (Annotation only)
     * Each has id, title and description, the active one is stored with each annotation
     */
    heuristic: {
      type: ParameterType.OBJECT,
      default: null
    },
    /**
     * CSS applied only to the `interface` snapshots inside their own shadow root (Annotation only)
     * e.g. the captured app's real stylesheet, resets included, nothing leaks in or out
     */
    theme: {
      type: ParameterType.STRING,
      default: null
    },
    /**
     * Overrides for the plugin's own UI texts, see UiLabels in lib/labels.ts
     * Missing keys keep the defaults, `interface`, `heuristic` and `severity_scale` are not affected
     */
    labels: {
      type: ParameterType.OBJECT,
      default: null
    }
  },
  data: {
    /** Final state of all placed components: instanceId, registryId, x, y and optional annotation */
    components: {
      type: ParameterType.OBJECT,
    },
    /** Timestamped log of all interactions (DropEvent, MoveEvent, AnnotateEvent), see App.tsx */
    events: {
      type: ParameterType.OBJECT,
    },
    /** Base64 JPEG of the canvas at trial end, only if `screenshot` is true */
    screenshot: {
      type: ParameterType.STRING,
    },
    /** General notes per heuristic id from the sidebar, only if `heuristic` is set */
    heuristicNotes: {
      type: ParameterType.OBJECT,
    },
    /**
     * All element annotations grouped by heuristic (Annotation only)
     * Shape: Record<heuristicId | "__none__", Record<elementId, { annotationText, heuristicId? }>>
     */
    annotations: {
      type: ParameterType.OBJECT,
    }
  },
  // Generated from CITATION.cff on build
  citations: '__CITATIONS__',
} as const;

type Info = typeof info;

/**
 * **plugin-interface-evaluator**
 *
 * 
 *
 * @author L0i0n0a 
 * @see {@link /tree/main/Entwicklung/CODE/plugin-interface-evaluator/README.md}}
 */
class InterfaceEvaluator implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    /*
     * jsPsych reuses display_element across trials but keeps its inline styles,
     * so they are saved here and restored in handleFinish
     */
    const previousStyleText = display_element.getAttribute("style");

    // Reset jsPsych's default max-width, padding and margin for a full screen layout
    display_element.style.width = "100vw";
    display_element.style.height = "100vh";
    display_element.style.maxWidth = "none";
    display_element.style.padding = "0";
    display_element.style.margin = "0";
    display_element.style.overflow = "hidden";

    // Shadow root keeps the plugin's Tailwind styles and the host experiment's CSS apart
    const shadowHost = document.createElement("div");
    shadowHost.style.height = "100%";
    display_element.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    hoistDocumentRules("plugin-interface-evaluator-rules", styles);
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);

    /*
     * The snapshot theme is not added here because its utilities would override the plugin's own,
     * App applies it inside the snapshot's nested shadow root instead
     */
    let snapshotTheme: string | undefined;
    if (trial.outputType === "Annotation" && typeof trial.theme === "string") {
      hoistDocumentRules("plugin-interface-evaluator-theme-rules", trial.theme);
      snapshotTheme = makeThemeCssShadowSafe(trial.theme);
    }

    const mount = document.createElement("div");
    mount.id = "root";
    shadowRoot.appendChild(mount);

    const root = createRoot(mount);

    const handleFinish = (data: FinishData) => {
      // Unmount before finishTrial so React cleans up before jsPsych removes the element
      root.unmount();
      // Restore the inline styles saved above for the next trial
      if (previousStyleText === null) {
        display_element.removeAttribute("style");
      } else {
        display_element.setAttribute("style", previousStyleText);
      }
      this.jsPsych.finishTrial(data);
    }

    if (trial.outputType === "Annotation") {
      root.render(
        <App
          onFinish={handleFinish}
          outputType="Annotation"
          interfaceContent={trial.interface as ReactElement | string | string[]}
          interfaceLabels={trial.interface_labels ?? undefined}
          theme={snapshotTheme}
          severityScale={(trial.severity_scale as SeverityScale | null) ?? undefined}
          heuristic={trial.heuristic as Heuristic[]}
          screenshotUI={trial.screenshot}
          labels={(trial.labels as Partial<UiLabels> | null) ?? undefined}
        />
      );
    } else {
      root.render(
        <App
          onFinish={handleFinish}
          outputType="Interface Building"
          allowedComponents={trial.components as (string | ComponentItem)[]}
          screenshotUI={trial.screenshot}
          labels={(trial.labels as Partial<UiLabels> | null) ?? undefined}
        />
      );
    }
  }
}

export default InterfaceEvaluator;
