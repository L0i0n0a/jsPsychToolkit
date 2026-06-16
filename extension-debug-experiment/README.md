# extension-debug-experiment

A jsPsych extension that adds a developer debug overlay to any experiment. Helps researchers debug without clicking through every trial manually.

## Features

| Feature | Parameter | Description |
|---|---|---|
| Trial Navigator | `trialNavigator: true` | Floating panel (bottom-left) with a slider and timeline chip strip to jump to any trial |
| Timeline Preview | `timelinePreview: true` | Clickable chip per trial inside the Navigator — shows trial type abbreviation, highlights current trial |
| Auto Responder | `autoResponder: true` | Automatically clicks the first button and fills text fields with "lorem ipsum" |
| State Inspector | `stateInspector: true` | Floating panel (bottom-right) showing live `jsPsych.data` after each trial |
| Data Export | `showExport: true` | Button (top-right) to download current jsPsych data as JSON |
| Jump to Trial | `jumpToTrial: N` | Start the experiment at trial N (zero-based) |
| Breakpoint | `breakpointsActive: true` + `breakpointNumber: N` | Pause the experiment when trial N is reached — a Resume button appears in the panel |

**Keyboard shortcuts:**
- `Ctrl+D` — toggle all panels on/off
- `Shift+ArrowRight` — skip current trial once (without enabling Auto Responder permanently)

> **Note:** The skip shortcut may conflict with jsPsych plugins that accept keyboard input (e.g. `html-keyboard-response`), because both the plugin and the extension listen on the same `keydown` event. If skipping two trials at once is observed, use the slider or timeline chips instead.

**Timeline chip legend:**
- Purple chip = current trial
- Dark grey chip = visited trial (hover shows type name)
- Near-black chip = future trial (type unknown)

## Recorded Data

The extension adds two fields to every trial's data:

| Field | Type | Description |
|---|---|---|
| `debug_skipped` | boolean | `true` if the trial was auto-skipped while jumping to a target |
| `debug_autoresponded` | boolean | `true` if the Auto Responder answered this trial |

## Compatibility

Requires jsPsych v8.2.0 or later. No additional dependencies — works with any jsPsych plugin, no React required.

## Loading

### Via `<script>` tag

```html
<script src="https://unpkg.com/jspsych@8.2.3"></script>
<script src="dist/index.browser.min.js"></script>
```

### Via npm

```js
import jsPsychExtensionDebugExperiment from "extension-debug-experiment";
```

## Usage

```js
const jsPsych = initJsPsych({
  extensions: [
    {
      type: jsPsychExtensionDebugExperiment,
      params: {
        trialNavigator: true,    // show navigator panel with slider + chip strip
        timelinePreview: true,   // show clickable chip per trial inside the navigator
        stateInspector: true,    // show live data inspector
        showExport: true,        // show JSON download button
        autoResponder: false,    // do not auto-click
        jumpToTrial: 3,          // start at trial index 3 (zero-based)
        breakpointsActive: true,
        breakpointNumber: 7,     // pause at trial index 7
      },
    },
  ],
});

// Add the extension to each trial you want to debug
const trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Hello",
  extensions: [{ type: jsPsychExtensionDebugExperiment }],
};
```

## Notes

- Trial indices are **zero-based**: `jumpToTrial: 0` is the first trial.
- **Backwards navigation** via the slider or timeline chips reloads the page and uses `sessionStorage` to store the target — this clears all recorded data up to that point (expected during development).
- **Auto Responder vs. Jump to Trial are separate features.** `jumpToTrial` and the slider skips trials by calling `finishTrial()` directly. No interaction is needed, regardless of `autoResponder`. The Auto Responder is designed for *fully automated runs*: it fills in every trial it encounters, including the target trial and all trials after it. It is **not** intended for manual debugging sessions where you want to inspect or interact with specific trials yourself. For manual navigation, use the slider or timeline chips and keep `autoResponder: false`.
- `debug_skipped` and `debug_autoresponded` are reset at the start of each trial so they only reflect the current trial.
- `timelinePreview` requires `trialNavigator: true` to be visible.
