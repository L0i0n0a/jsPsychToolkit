import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
export { default as AnnotateWrapper } from "./components/utils/AnnotateWrapper";
import "./index.css";

import { version } from "../package.json";
import { createRoot } from "react-dom/client"
import App, {FinishData} from "./App";
import { ReactElement } from "react";
import { ComponentItem } from "./components/component-library";
import { Heuristic } from "./lib/types";

const info = {
  name: "plugin-interface-evaluator",
  version: version,
  parameters: {
    /** Components available in the sidebar. Accepts three formats:
     * - String IDs from the built-in library: e.g. ["button-primary", "input"]
     * - Custom ComponentItem objects with id, label, category, defaultProps, preview(), render()
     * - A mix of both: ["button-primary", { id: "my-component", ... }]
     * If not provided, all built-in components are shown.
     * Only used when outputType is "Interface Building".
     */
    components: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /** Determines the mode of the plugin.
     * "Annotation": shows a fixed interface that participants can annotate.
     * "Interface Building": provides a canvas and sidebar to build an interface from components.
     */
    outputType: {
      type: ParameterType.SELECT,
      options: ["Annotation", "Interface Building"],
      default: "Annotation"
    },
    /** HTML string of the interface to be annotated.
     * Only used when outputType is "Annotation".
     * The HTML will be rendered inside the canvas for the participant to interact with.
     */
    interface: {
      type: ParameterType.COMPLEX,
      default: null
    },
    /** Whether to capture a screenshot of the canvas at the end of the trial.
     * The screenshot is saved as a base64 JPEG string in the trial data.
     * Increases data size significantly — only enable when needed.
     */
    screenshot: {
      type: ParameterType.BOOL,
      default: false
    },
    /** Optional list of heuristics shown in a sidebar during annotation.
     * Each heuristic has an id, title, and description.
     * The active heuristic is recorded alongside each element annotation.
     * If not provided, no heuristic sidebar is shown.
     * Only used when outputType is "Annotation".
     */
    heuristic: {
      type: ParameterType.OBJECT,
      default: null
    }
  },
  data: {
    /** Final state of all placed components at trial end.
     * Each entry contains: instanceId, registryId, x, y, and optionally annotation (string).
     */
    components: {
      type: ParameterType.OBJECT,
    },
    /** Timestamped log of all participant interactions during the trial.
     * Each entry is one of: DropEvent, MoveEvent, or AnnotateEvent.
     * See App.tsx for the exact shape of each event type.
     */
    events: {
      type: ParameterType.OBJECT,
    },
    /** Base64-encoded JPEG screenshot of the canvas, captured at the end of the trial.
     * Only present when the screenshot parameter is set to true.
     */
    screenshot: {
      type: ParameterType.STRING,
    },
    /** Per-heuristic general notes entered in the sidebar.
     * Keys are heuristic IDs; values are the free-text notes entered by the participant.
     * Only present when the heuristic parameter is set.
     */
    heuristicNotes: {
      type: ParameterType.OBJECT,
    },
    /** All element annotations, grouped by heuristic.
     * Shape: Record<heuristicId | "__none__", Record<elementId, { annotationText, heuristicId? }>>
     * Only present when outputType is "Annotation".
     */
    annotations: {
      type: ParameterType.OBJECT,
    }
  },
  // When you run build on your plugin, citations will be generated here based on the information in the CITATION.cff file.
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
    // jsPsych sets max-width, padding, and margin on the display element by default.
    // Our plugin needs true full-screen layout, so we reset those here.
    display_element.style.width = "100vw";
    display_element.style.height = "100vh";
    display_element.style.maxWidth = "none";
    display_element.style.padding = "0";
    display_element.style.margin = "0";
    display_element.style.overflow = "hidden";

    const root = createRoot(display_element);

    const handleFinish = (data: FinishData) => {
      // Unmount before finishTrial so React cleans up before jsPsych removes the element.
      root.unmount();
      this.jsPsych.finishTrial(data);
    }

    if (trial.outputType === "Annotation") {
      root.render(
        <App
          onFinish={handleFinish}
          outputType="Annotation"
          interfaceContent={trial.interface as ReactElement}
          heuristic={trial.heuristic as Heuristic[]}
          screenshotUI={trial.screenshot}
        />
      );
    } else {
      root.render(
        <App
          onFinish={handleFinish}
          outputType="Interface Building"
          allowedComponents={trial.components as (string | ComponentItem)[]}
          screenshotUI={trial.screenshot}
        />
      );
    }
  }
}

export default InterfaceEvaluator;
