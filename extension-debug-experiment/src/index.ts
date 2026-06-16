import {
  JsPsych,
  JsPsychExtension,
  JsPsychExtensionInfo,
  ParameterType,
} from "jspsych";

import { version } from "../package.json";

// Key used to pass the jump target across a page reload for backwards navigation
const STORAGE_KEY = "jspsych-debug-jump";

// Converts a jsPsych plugin name to a 1-2 char abbreviation for timeline chips.
// Strips common prefixes ("html", "jspsych") and returns the first letter of
// the meaningful segment, e.g. "html-keyboard-response" → "K", "survey-text" → "S".
function typeAbbrev(name: string): string {
  const skip = new Set(["html", "jspsych", "plugin"]);
  const parts = name.split("-").filter((p) => !skip.has(p));
  return (parts[0]?.[0] ?? name[0]).toUpperCase();
}

interface InitializeParameters {
  /** Show the Trial Navigator panel with slider (bottom-left). Default: false */
  trialNavigator?: boolean;
  /** Automatically click the first button / fill text fields on each trial. Default: false */
  autoResponder?: boolean;
  /** Show the State Inspector panel with live jsPsych data (bottom-right). Default: false */
  stateInspector?: boolean;
  /** Pause the experiment when a specific trial index is reached. Default: false */
  breakpointsActive?: boolean;
  /** Trial index to jump to on start. Zero-based: jumpToTrial: 3 skips to the 4th trial. */
  jumpToTrial?: number;
  /** Trial index at which to pause the experiment (requires breakpointsActive: true). Zero-based. */
  breakpointNumber?: number;
  /** Show data export button in dev mode to quickly check the resonses */
  showExport?: boolean;
  /** Show a clickable timeline strip below the slider with one chip per trial. Default: false */
  timelinePreview?: boolean;
}

interface OnStartParameters {}

interface OnLoadParameters {}

interface OnFinishParameters {}

/**
 * **extension-debug-experiment**
 *
 * A jsPsych extension that adds a developer debug overlay to any experiment.
 * Features: trial navigator with slider, auto-responder, live state inspector, and breakpoints.
 * Toggle all panels with Ctrl+D.
 *
 * @author L0i0n0a 
 * @see {@link /tree/main/Entwicklung/CODE/extension-extension-debug-experiment/README.md}}
 */
class ExtensionDebugExperimentExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "extension-debug-experiment",
    version: version,
    data: {
      debug_skipped: { type: ParameterType.BOOL },
      debug_autoresponded: { type: ParameterType.BOOL },
    },
    citations: "__CITATIONS__",
  };

  // Debug responses
  private debug_skipped: boolean = false;
  private debug_autoresponded: boolean = false;

  // Feature flags — set once in initialize, read in on_load
  private autoResponder: boolean = false;
  private breakpointsActive: boolean = false;

  // Jump target — updated by slider or sessionStorage after page reload
  private jumpToTrial: number = 0;
  private breakpointNumber: number = 0;

  // DOM references — null when the corresponding feature is disabled
  private container: HTMLDivElement | null = null; // navigator panel
  private stateContainer: HTMLDivElement | null = null; // state inspector panel
  private slider: HTMLInputElement | null = null;
  private trialLabel: HTMLDivElement | null = null;
  private resumeButton: HTMLButtonElement | null = null; // shown only when paused at breakpoint
  private showExport: HTMLButtonElement | null = null;
  private timelineContainer: HTMLDivElement | null = null;
  private trialTypes: string[] = [];

  private panelVisible: boolean = true;

  constructor(private jsPsych: JsPsych) {}

  initialize = ({
    trialNavigator = false,
    autoResponder = false,
    stateInspector = false,
    breakpointsActive = false,
    jumpToTrial = 0,
    breakpointNumber = 0,
    showExport = false,
    timelinePreview = false,
  }: InitializeParameters): Promise<void> => {
    return new Promise((resolve) => {
      this.autoResponder = autoResponder;
      this.breakpointsActive = breakpointsActive;
      this.breakpointNumber = breakpointNumber;

      // Backwards navigation stores the target in sessionStorage before reloading the page.
      // On the next load we pick it up here and remove it so it only fires once.
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        this.jumpToTrial = parseInt(stored);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        this.jumpToTrial = jumpToTrial;
      }

      if (trialNavigator) {
        this.container = document.createElement("div");
        this.container.style.cssText = [
          "position:fixed",
          "bottom:16px",
          "left:16px",
          "background:#18181b",
          "color:#e4e4e7",
          "padding:14px 16px",
          "border-radius:10px",
          "font-family:ui-monospace,monospace",
          "font-size:12px",
          "z-index:99999",
          "min-width:220px",
          "box-shadow:0 4px 24px rgba(0,0,0,0.5)",
          "border:1px solid #3f3f46",
          "user-select:none",
        ].join(";");

        // Header row: title + collapse button
        const header = document.createElement("div");
        header.style.cssText =
          "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;";

        const title = document.createElement("span");
        title.textContent = "🧪 Debug";
        title.style.cssText = "font-weight:bold;color:#a78bfa;font-size:13px;";
        header.appendChild(title);

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = "−";
        toggleBtn.title = "Toggle panels (Ctrl+D)";
        toggleBtn.style.cssText =
          "background:none;border:none;color:#71717a;cursor:pointer;font-size:16px;padding:0;line-height:1;";
        toggleBtn.addEventListener("click", () => this.togglePanel());
        header.appendChild(toggleBtn);

        this.container.appendChild(header);

        // Body: trial label + slider
        const body = document.createElement("div");
        body.id = "jspsych-debug-body";

        this.trialLabel = document.createElement("div");
        this.trialLabel.style.cssText = "color:#71717a;margin-bottom:8px;";
        this.trialLabel.textContent = "Trial — / —";
        body.appendChild(this.trialLabel);

        this.slider = document.createElement("input");
        this.slider.type = "range";
        this.slider.min = "0";
        this.slider.value = "0";
        this.slider.style.cssText =
          "width:100%;accent-color:#a78bfa;cursor:pointer;";
        this.slider.addEventListener("change", () => {
          const target = parseInt(this.slider!.value);
          const current = this.jsPsych.getProgress().current_trial_global;
          if (target < current) {
            // Backwards jump: jsPsych has no rewind API, so we store the target
            // and reload the page — initialize() will pick it up from sessionStorage.
            sessionStorage.setItem(STORAGE_KEY, String(target));
            location.reload();
          } else {
            // Forwards jump: set target and finish the current trial to trigger on_load loop
            this.jumpToTrial = target;
            this.jsPsych.finishTrial();
          }
        });
        body.appendChild(this.slider);

        // Resume button — hidden until a breakpoint pauses the experiment
        this.resumeButton = document.createElement("button");
        this.resumeButton.textContent = "▶ Resume";
        this.resumeButton.style.cssText =
          "display:none;margin-top:10px;width:100%;padding:6px;background:#a78bfa;color:#18181b;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-family:inherit;";
        this.resumeButton.addEventListener("click", () => {
          this.resumeButton!.style.display = "none";
          this.jsPsych.resumeExperiment();
        });
        body.appendChild(this.resumeButton);

        if (timelinePreview) {
          this.timelineContainer = document.createElement("div");
          this.timelineContainer.style.cssText =
            "margin-top:10px;display:flex;flex-wrap:wrap;gap:4px;max-height:96px;overflow-y:auto;";
          body.appendChild(this.timelineContainer);
        }

        this.container.appendChild(body);
        document.body.appendChild(this.container);
      }

      if (stateInspector) {
        this.stateContainer = document.createElement("div");
        this.stateContainer.style.cssText = [
          "position:fixed",
          "bottom:16px",
          "right:16px",
          "background:#18181b",
          "color:#e4e4e7",
          "padding:14px 16px",
          "border-radius:10px",
          "font-family:ui-monospace,monospace",
          "font-size:11px",
          "z-index:99999",
          "max-width:280px",
          "max-height:360px",
          "overflow-y:auto",
          "box-shadow:0 4px 24px rgba(0,0,0,0.5)",
          "border:1px solid #3f3f46",
        ].join(";");

        const stateTitle = document.createElement("div");
        stateTitle.textContent = "📊 State Inspector";
        stateTitle.style.cssText =
          "font-weight:bold;color:#34d399;margin-bottom:8px;font-size:13px;";
        this.stateContainer.appendChild(stateTitle);

        const stateBody = document.createElement("pre");
        stateBody.id = "jspsych-debug-state";
        stateBody.style.cssText =
          "margin:0;white-space:pre-wrap;word-break:break-all;color:#a1a1aa;";
        stateBody.textContent = "Waiting for first trial...";
        this.stateContainer.appendChild(stateBody);

        document.body.appendChild(this.stateContainer);
      }

      if (showExport) {
        this.showExport = document.createElement("button");
        this.showExport.textContent = "Data Export";
        this.showExport.style.cssText = [
          "position:fixed",
          "right:16px",
          "top:16px",
          "background:#18181b",
          "color:#e4e4e7",
          "padding:14px 16px",
          "border-radius:10px",
          "font-family:ui-monospace,monospace",
          "font-size:11px",
          "z-index:99999",
          "max-width:280px",
          "max-height:360px",
          "overflow-y:auto",
          "box-shadow:0 4px 24px rgba(0,0,0,0.5)",
          "border:1px solid #3f3f46",
          "cursor:pointer",
        ].join(";");

        this.showExport.addEventListener("click", (event) => {
          const blob = new Blob(
            [JSON.stringify(this.jsPsych.data.get().values())],
            {
              type: "application/json",
            },
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "jspsych-data.json";
          a.click();
        });

        document.body.appendChild(this.showExport);
      }

      // Keyboard shortcuts:
      // Ctrl+D     — toggle all panels
      // Shift+Space — skip current trial once (without enabling autoResponder permanently)
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "d") {
          e.preventDefault();
          this.togglePanel();
        }
        if (e.shiftKey && e.key === "ArrowRight") {
          e.preventDefault();
          this.jsPsych.finishTrial();
        }
      });

      resolve();
    });
  };

  // Collapses or expands the body of the navigator panel and hides the state inspector
  private togglePanel = (): void => {
    this.panelVisible = !this.panelVisible;
    const body = document.getElementById("jspsych-debug-body");
    if (body) body.style.display = this.panelVisible ? "block" : "none";
    if (this.stateContainer) {
      this.stateContainer.style.display = this.panelVisible ? "block" : "none";
    }
  };

  on_start = ({}: OnStartParameters = {}): void => {
    this.debug_skipped = false;
    this.debug_autoresponded = false;
  };

  on_load = ({}: OnLoadParameters = {}): void => {
    const progress = this.jsPsych.getProgress();

    // Update navigator panel: sync slider position, tooltip and trial type label
    if (this.container && this.slider && this.trialLabel) {
      this.slider.max = String(progress.total_trials - 1);
      this.slider.value = String(progress.current_trial_global);
      const trial = this.jsPsych.getCurrentTrial();
      const trialType = (trial as any)?.type?.info?.name ?? "unknown";
      this.slider.title = `Trial ${progress.current_trial_global}: ${trialType}`;
      this.trialLabel.textContent = `Trial ${progress.current_trial_global} / ${progress.total_trials - 1} — ${trialType}`;

      // Timeline preview: rebuild chip strip on every trial so current chip is highlighted
      if (this.timelineContainer) {
        this.timelineContainer.innerHTML = "";
        this.trialTypes[progress.current_trial_global] = trialType;
        let currentChip: HTMLSpanElement | null = null;
        for (let i = 0; i < progress.total_trials; i++) {
          const chip = document.createElement("span");
          const isCurrent = i === progress.current_trial_global;
          const knownType = this.trialTypes[i];
          chip.textContent = knownType ? typeAbbrev(knownType) : "?";
          chip.title = `Trial ${i}: ${knownType ?? "unknown"}`;
          const baseBg = isCurrent
            ? "#a78bfa"
            : knownType
            ? "#3f3f46"
            : "#27272a";
          const baseColor = isCurrent ? "#18181b" : knownType ? "#e4e4e7" : "#52525b";
          chip.style.cssText = [
            "display:inline-flex",
            "align-items:center",
            "justify-content:center",
            "width:22px",
            "height:22px",
            "border-radius:4px",
            "font-size:10px",
            "cursor:pointer",
            "transition:background 0.1s",
            `background:${baseBg}`,
            `color:${baseColor}`,
            isCurrent ? "font-weight:bold;" : "",
          ].join(";");
          chip.addEventListener("mouseenter", () => {
            chip.style.background = isCurrent ? "#c4b5fd" : "#52525b";
          });
          chip.addEventListener("mouseleave", () => {
            chip.style.background = baseBg;
          });
          chip.addEventListener("click", () => {
            const current = this.jsPsych.getProgress().current_trial_global;
            if (i < current) {
              sessionStorage.setItem(STORAGE_KEY, String(i));
              location.reload();
            } else {
              this.jumpToTrial = i;
              this.jsPsych.finishTrial();
            }
          });
          this.timelineContainer.appendChild(chip);
          if (isCurrent) currentChip = chip;
        }
        currentChip?.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }

    // Update state inspector with latest jsPsych data
    if (this.stateContainer) {
      const stateBody = document.getElementById("jspsych-debug-state");
      if (stateBody) {
        stateBody.textContent = JSON.stringify(
          this.jsPsych.data.get().values(),
          null,
          2,
        );
      }
    }

    // If we haven't reached the jump target yet, skip this trial immediately.
    // This handles both jumpToTrial (set at init) and slider forward-jumps.
    if (this.jumpToTrial && progress.current_trial_global < this.jumpToTrial) {
      this.jsPsych.finishTrial();
      this.debug_skipped = true;
      return; // skip auto-responder and breakpoint checks while fast-forwarding
    }

    // Auto-responder: fill text inputs, click buttons, or simulate a keypress.
    // Scoped to the jsPsych display element so debug panel buttons are not targeted.
    if (this.autoResponder) {
      const display = this.jsPsych.getDisplayElement();
      const input = display.querySelector<HTMLInputElement>("input[type=text], textarea");
      if (input) input.value = "lorem ipsum";
      this.debug_autoresponded = true;
      const button = display.querySelector<HTMLButtonElement>("button");
      if (button) {
        button.click();
      } else {
        // No button — simulate a keypress for keyboard-response type trials.
        // Use the first entry in choices if restricted, otherwise fall back to 'a'.
        const choices = (this.jsPsych.getCurrentTrial() as any)?.choices;
        const key = Array.isArray(choices) && choices.length > 0 ? choices[0] : "a";
        document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
      }
    }

    // Breakpoint: pause the experiment and show the resume button
    if (this.breakpointsActive && this.breakpointNumber) {
      if (progress.current_trial_global === this.breakpointNumber) {
        if (this.resumeButton) this.resumeButton.style.display = "block";
        this.jsPsych.pauseExperiment();
      }
    }
  };

  on_finish = ({}: OnFinishParameters = {}): { [key: string]: any } => {
    return {
      debug_skipped: this.debug_skipped,
      debug_autoresponded: this.debug_autoresponded,
    };
  };
}

export default ExtensionDebugExperimentExtension;
