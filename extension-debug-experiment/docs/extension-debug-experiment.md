# extension-debug-experiment

This extension adds a developer debug overlay to any jsPsych experiment. It allows researchers to jump to any trial without clicking through all preceding ones, inspect live data, and set breakpoints — all without modifying the experiment itself.

## Parameters

### Initialization Parameters

Initialization parameters are set when calling `initJsPsych()`.

```js
initJsPsych({
  extensions: [
    { type: jsPsychExtensionDebugExperiment, params: { ... } }
  ]
})
```

Parameter | Type | Default | Description
----------|------|---------|------------
`trialNavigator` | boolean | `false` | Show the floating navigator panel (bottom-left) with a slider and timeline chip strip
`timelinePreview` | boolean | `false` | Show a clickable chip per trial inside the navigator panel. Requires `trialNavigator: true`
`autoResponder` | boolean | `false` | Automatically fill the first text input with "lorem ipsum" and click the first button on each trial
`stateInspector` | boolean | `false` | Show a floating panel (bottom-right) with the current `jsPsych.data` as formatted JSON
`showExport` | boolean | `false` | Show a button (top-right) to download the current jsPsych data as a JSON file
`jumpToTrial` | number | `0` | Skip directly to this trial index on experiment start (zero-based)
`breakpointsActive` | boolean | `false` | Enable breakpoint support
`breakpointNumber` | number | `0` | Trial index at which to pause the experiment. Requires `breakpointsActive: true`

### Trial Parameters

Trial parameters are set when adding the extension to an individual trial. The debug extension does not require any trial-level parameters — the empty object is sufficient.

```js
var trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Hello",
  extensions: [
    { type: jsPsychExtensionDebugExperiment }
  ]
}
```

The extension must be listed in both `initJsPsych()` and each trial's `extensions` array for data to be recorded correctly.

## Data Generated

Name | Type | Description
-----|------|------------
`debug_skipped` | boolean | `true` if this trial was automatically skipped while fast-forwarding to a `jumpToTrial` target
`debug_autoresponded` | boolean | `true` if the Auto Responder filled and submitted this trial

## Keyboard Shortcuts

Shortcut | Action
---------|-------
`Ctrl+D` | Toggle all debug panels on/off
`Shift+ArrowRight` | Skip the current trial once (does not permanently enable Auto Responder)

> **Note:** The skip shortcut may conflict with jsPsych plugins that accept keyboard input, because both the plugin and the extension register `keydown` listeners on the same document. If two trials are skipped at once, use the slider or timeline chips instead.

## Notes

- Trial indices are **zero-based**: `jumpToTrial: 0` is the first trial.
- **Backwards navigation** (via slider or timeline chips) reloads the page and uses `sessionStorage` to restore the jump target. All recorded data up to that point is cleared — this is expected during development.
- The Auto Responder is suppressed while fast-forwarding to avoid interfering with `jumpToTrial`.
- `debug_skipped` and `debug_autoresponded` reset at the start of each trial and only reflect the current trial.
