# plugin-interface-evaluator

A jsPsych plugin that enables researchers to present interfaces for annotation or lets participants build interfaces from components.

The plugin supports two modes:

- **Annotation** – participants see a fixed interface (provided as HTML) and can click on elements to annotate them. Optionally, a sidebar with usability heuristics (e.g. Nielsen's 10) guides the annotation.
- **Interface Building** – participants drag components from a sidebar onto a canvas to build their own interface layout.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of `undefined` must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter    | Type    | Default Value  | Description                                                                                                                                                                                                                    |
| ------------ | ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `outputType` | SELECT  | `"Annotation"` | Determines the plugin mode. `"Annotation"`: shows a fixed interface that participants annotate. `"Interface Building"`: provides a canvas and sidebar for building an interface from components.                                 |
| `interface`  | COMPLEX | `null`         | The interface to be annotated, provided as an HTML string or React element. Rendered inside the canvas. Only used when `outputType` is `"Annotation"`.                                                                         |
| `heuristic`  | OBJECT  | `null`         | Optional list of heuristics shown in a sidebar during annotation. Each heuristic is an object with `id` (string), `title` (string), and `description` (string). Only used when `outputType` is `"Annotation"`.                 |
| `components` | OBJECT  | `null`         | Components available in the sidebar for interface building. Accepts built-in string IDs (e.g. `"button-primary"`), custom `ComponentItem` objects, or a mix of both. If `null`, all built-in components are shown. Only used when `outputType` is `"Interface Building"`. |
| `screenshot` | BOOL    | `false`        | Whether to capture a screenshot of the canvas at the end of the trial. Saved as a base64 JPEG string. Increases data size — only enable when needed.                                                                           |

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name             | Type   | Value                                                                                                                                                                              |
| ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`     | OBJECT | Final state of all placed components at trial end. Each entry contains: `instanceId`, `registryId`, `x`, `y`, and optionally `annotation` (string).                               |
| `events`         | OBJECT | Timestamped log of all participant interactions during the trial. Each entry is a `DropEvent`, `MoveEvent`, or `AnnotateEvent`.                                                    |
| `annotations`    | OBJECT | All element annotations, grouped by heuristic. Shape: `Record<heuristicId \| "__none__", Record<elementId, { annotationText, heuristicId? }>>`. Only present in Annotation mode.  |
| `heuristicNotes` | OBJECT | Per-heuristic general notes entered in the sidebar. Keys are heuristic IDs; values are free-text strings. Only present when `heuristic` is set.                                   |
| `screenshot`     | STRING | Base64-encoded JPEG screenshot of the canvas. Only present when `screenshot` parameter is `true`.                                                                                  |

## Install

This plugin is not published on npm or in the official jsPsych plugin registry — it lives in this repo only. Build it once, then reference it as a local `file:` dependency from your experiment project:

```bash
cd plugin-interface-evaluator
npm install
npm run build
```

```json
// package.json of your experiment project
"dependencies": {
  "plugin-interface-evaluator": "file:../path/to/plugin-interface-evaluator"
}
```

```bash
npm install --legacy-peer-deps
```

> Plain `npm install` can fail here with `Cannot read properties of null (reading 'edgesOut')` — a known npm/arborist bug when resolving the peer-dependency tree of a nested `file:` dependency. Use `--legacy-peer-deps` to work around it.

Then import it normally:

```javascript
import jsPsychInterfaceEvaluator from "plugin-interface-evaluator";
```

Or include the prebuilt browser bundle directly in your HTML instead of using a bundler:

```html
<script src="path/to/plugin-interface-evaluator/dist/index.browser.min.js"></script>
```

The global `jsPsychInterfaceEvaluator` is the plugin class and can be used directly as `type` in a jsPsych trial.

> **Note:** This plugin requires React 19 as a peer dependency. Make sure it is available in your project.

## Examples

### Annotation mode (without heuristics)

Participants click on elements of a fixed interface and annotate them with free text.

```javascript
var trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `
    <div style="padding: 24px; font-family: sans-serif;">
      <h2>Example Interface</h2>
      <button style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 4px;">
        Primary Button
      </button>
      <input type="text" placeholder="Text input" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
    </div>
  `,
};
```

### Annotation mode (with heuristics)

A heuristic sidebar appears on the right. Participants first select an active heuristic, then annotate interface elements.

```javascript
var trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `<div>...</div>`,
  heuristic: [
    { id: "n1", title: "1 – Visibility of System Status", description: "The system should always keep users informed about what is going on." },
    { id: "n2", title: "2 – Match Between System and the Real World", description: "The system should speak the user's language." },
    // ... more heuristics
  ],
};
```

### Interface Building mode

Participants drag and drop components from a sidebar onto a canvas to build their own interface layout. A screenshot of the result is captured at the end.

```javascript
var trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Interface Building",
  screenshot: true,
  // Optional: restrict which components appear in the sidebar
  // components: ["button-primary", "input-text"],
};
```
