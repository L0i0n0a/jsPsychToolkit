# plugin-interface-evaluator

A jsPsych plugin for interface evaluation studies. Supports two modes:

- **Annotation** — participants annotate elements of an existing interface
- **Interface Building** — participants build an interface from a sidebar of draggable components

**New to this?** Start with the step by step guide: [English](docs/GUIDE.md) · [Deutsch](docs/ANLEITUNG.md)

## Compatibility

Requires jsPsych v8.0.0 or later.

## Loading

Not published on npm or in the official jsPsych plugin registry. Currently used locally via a `file:` dependency. Build the plugin first:

```bash
npm install
npm run build
```

For a bundler-based project, add it as a local dependency in the experiment's `package.json`:

```json
"dependencies": {
  "plugin-interface-evaluator": "file:../path/to/plugin-interface-evaluator"
}
```

```bash
npm install --legacy-peer-deps
```

> Plain `npm install` can fail with `Cannot read properties of null (reading 'edgesOut')` (a known npm/arborist bug resolving peer deps of a nested `file:` dependency) — use `--legacy-peer-deps`.

```javascript
import jsPsychInterfaceEvaluator from "plugin-interface-evaluator";
```

Or load the prebuilt browser bundle directly in HTML:

```html
<script src="/node_modules/jspsych/dist/index.browser.min.js"></script>
<script src="path/to/plugin-interface-evaluator/dist/index.browser.min.js"></script>
```

The global `jsPsychInterfaceEvaluator` is the plugin class and can be used directly as `type` in a jsPsych trial.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `outputType` | `"Annotation"` \| `"Interface Building"` | `"Annotation"` | Plugin mode |
| `interface` | HTML string \| ReactElement | `null` | Interface to annotate (Annotation mode only) |
| `components` | `(string \| ComponentItem)[]` | `null` | Components shown in sidebar (Interface Building only). If null, all built-in components are shown. |
| `heuristic` | `Heuristic[]` | `null` | Optional list of heuristics shown in a sidebar during annotation. Each heuristic has `id`, `title`, `description`. |
| `screenshot` | boolean | `false` | Capture a screenshot of the canvas at trial end (Interface Building only). |
| `labels` | `Partial<UiLabels>` | `null` | Overrides for the plugin's own UI texts (`annotationTitle`, `annotationPlaceholder`, `annotationHeuristic`, `annotationHeuristicPlaceholder`, `cancel`, `save`, `heuristicsTitle`, `heuristicNotePlaceholder`, `heuristicDone`, `finish`). Missing entries keep the defaults (German; `finish` = "Finish"). Use it to localise the plugin. |

## Data collected

| Field | Type | Description |
|-------|------|-------------|
| `components` | object | Final state of all placed components (`instanceId`, `registryId`, `x`, `y`, `annotation`) |
| `events` | object | Timestamped log of all interactions (`drop`, `move`, `annotate`) |
| `screenshot` | string | Base64 JPEG screenshot, only present when `screenshot: true` |

## Examples

### Annotation without heuristics

```js
const trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `<div><h1>My Interface</h1><button>Click me</button></div>`,
};
```

### Annotation with Nielsen heuristics

```js
const trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `<div><h1>My Interface</h1><button>Click me</button></div>`,
  heuristic: [
    { id: "n1", title: "1 – Visibility of System Status", description: "Keep users informed about what is going on." },
    { id: "n2", title: "2 – Match Between System and the Real World", description: "Use words and concepts familiar to the user." },
    { id: "n3", title: "3 – User Control and Freedom", description: "Users need clearly marked emergency exits." },
    { id: "n4", title: "4 – Consistency and Standards", description: "Follow platform conventions." },
    { id: "n5", title: "5 – Error Prevention", description: "Design carefully to prevent problems from occurring." },
    { id: "n6", title: "6 – Recognition Rather Than Recall", description: "Minimize the user's memory load." },
    { id: "n7", title: "7 – Flexibility and Efficiency of Use", description: "Allow experienced users to tailor frequent actions." },
    { id: "n8", title: "8 – Aesthetic and Minimalist Design", description: "Dialogues should not contain irrelevant information." },
    { id: "n9", title: "9 – Help Users Recognize, Diagnose, and Recover from Errors", description: "Error messages should be expressed in plain language." },
    { id: "n10", title: "10 – Help and Documentation", description: "Provide easy-to-search documentation when needed." },
  ],
};
```

### Interface Building

```js
const trial = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Interface Building",
  components: ["button-primary", "input-text"], // optional filter
  screenshot: true,
};
```