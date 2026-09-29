# Guide: using plugin-interface-evaluator

*Deutsche Version: [ANLEITUNG.md](ANLEITUNG.md)*

This guide is for anyone who wants to add the plugin to their own jsPsych study, even with little programming experience. All you need is a text editor, a browser and, once, Node.js.

## Contents

1. [What does the plugin do?](#1-what-does-the-plugin-do)
2. [One time setup: build the plugin](#2-one-time-setup-build-the-plugin)
3. [Your first experiment in 5 minutes](#3-your-first-experiment-in-5-minutes)
4. [Copy and paste examples](#4-copy-and-paste-examples)
5. [Saving and understanding the data](#5-saving-and-understanding-the-data)
6. [All parameters at a glance](#6-all-parameters-at-a-glance)
7. [Troubleshooting](#7-troubleshooting)
8. [Advanced: using a bundler](#8-advanced-using-a-bundler)

---

## 1. What does the plugin do?

The plugin has two modes:

| Mode | What do participants see? | Use it for |
|---|---|---|
| **Annotation** | A finished interface (e.g. a saved page of your app as HTML). They click on elements and write notes about them. | Usability evaluations, heuristic evaluation |
| **Interface Building** | An empty canvas and a sidebar with building blocks (buttons, inputs, …). They drag blocks onto the canvas. | Letting participants design an interface themselves |

In Annotation mode you can also:

- show a **list of heuristics** (e.g. Nielsen's 10 heuristics)
- ask for a **severity rating** (e.g. 0 to 4)
- show **multiple screens** with tabs
- pass your app's **original stylesheet** so everything looks real

---

## 2. One time setup: build the plugin

The plugin is not published on npm, so you have to "build" it yourself once. This creates a single file that you include in your experiment.

**Requirement:** [Node.js](https://nodejs.org) (version 18 or newer) is installed. You can check this in a terminal with `node -v`.

Open a terminal (Windows: PowerShell) in the `plugin-interface-evaluator` folder and run:

```bash
npm install
npm run build
```

Afterwards this file exists:

```
plugin-interface-evaluator/dist/index.browser.min.js
```

That is the complete plugin (React is already included). It's all you need.

> **Tip:** If you copied `node_modules` from another computer or from WSL, delete the folder and run `npm install` again. Otherwise the tools for your operating system are missing.

---

## 3. Your first experiment in 5 minutes

### Step 1: Create a folder

Create a new folder for your study and copy the built file `dist/index.browser.min.js` into it:

```
my-study/
├── index.html
└── index.browser.min.js     ← copy from plugin-interface-evaluator/dist/
```

### Step 2: Create `index.html`

Copy this into `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Study</title>

    <!-- 1. Load jsPsych -->
    <script src="https://unpkg.com/jspsych@8/dist/index.browser.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css" />

    <!-- 2. Load the plugin (must come AFTER jsPsych) -->
    <script src="index.browser.min.js"></script>
  </head>
  <body></body>

  <script>
    // 3. Start jsPsych
    const jsPsych = initJsPsych({
      on_finish: () => {
        // At the end all data is downloaded as a file
        jsPsych.data.get().localSave("json", "results.json");
      },
    });

    // 4. The interface to be evaluated (plain HTML)
    const myInterface = `
      <div style="padding: 24px; font-family: sans-serif;">
        <h1>Welcome</h1>
        <p>Please sign in.</p>
        <input type="text" placeholder="Email" />
        <button>Sign in</button>
      </div>
    `;

    // 5. The trial using the plugin
    const evaluation = {
      type: jsPsychInterfaceEvaluator,
      outputType: "Annotation",
      interface: myInterface,
      labels: { // the plugin's default texts are German, this switches the main ones to English
        annotationPlaceholder: "What do you notice about this element?",
        cancel: "Cancel",
        save: "Save",
      },
    };

    // 6. Run the experiment
    jsPsych.run([evaluation]);
  </script>
</html>
```

### Step 3: Open it

Double click `index.html` and you're done. Click an element (e.g. the button), write a note, save it and click **Finish** at the bottom. The browser then downloads `results.json`.

> If double clicking doesn't work, start a small local server in the study folder with `npx serve .` and open the address it shows (usually `http://localhost:3000`).

---

## 4. Copy and paste examples

Each example only replaces the `const evaluation = { ... }` part from step 3. The rest of the file stays the same.

### 4.1 Simple annotation

Participants click on elements and write free text notes.

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `<div><h1>Title</h1><button>Click me</button></div>`,
};
```

### 4.2 With heuristics (e.g. Nielsen)

A list of heuristics appears on the right. Participants select a heuristic and then annotate elements for it. They can also write a general note per heuristic and jump to the next one with **Done** (German default: **Fertig**).

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: myInterface,
  heuristic: [
    { id: "n1", title: "1 Visibility of System Status", description: "The system always keeps users informed about what is going on." },
    { id: "n2", title: "2 Match Between System and the Real World", description: "The system speaks the users' language." },
    { id: "n3", title: "3 User Control and Freedom", description: "There are clearly marked emergency exits, e.g. cancel or undo." },
    // ... as many as you like
  ],
};
```

**Important:**

- Every heuristic needs a unique `id`. You'll find the data under this `id` later.
- As soon as heuristics are set, a heuristic must be selected in the annotation dialog before saving.

### 4.3 With a severity scale

The annotation dialog also shows a choice. Saving is only possible once a value is picked.

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: myInterface,
  severity_scale: {
    title: "Severity",
    options: [
      { value: 0, label: "0 Not a problem" },
      { value: 1, label: "1 Cosmetic problem" },
      { value: 2, label: "2 Minor problem" },
      { value: 3, label: "3 Major problem" },
      { value: 4, label: "4 Catastrophe" },
    ],
  },
};
```

### 4.4 Multiple screens with tabs

Instead of one HTML text, pass a list (`[ ... ]`). Tabs for switching appear at the top.

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: [
    `<div><h1>Home</h1><button>Next</button></div>`,
    `<div><h1>Form</h1><input placeholder="Name" /></div>`,
    `<div><h1>Confirmation</h1><p>Thank you!</p></div>`,
  ],
  interface_labels: ["Home", "Form", "Confirmation"], // optional, otherwise just "1", "2", "3"
};
```

In the data the element IDs then get a prefix per screen, e.g. `s1:h1-1` for the heading on screen 1 and `s2:h1-1` for the one on screen 2.

### 4.5 Recreating a real app (custom stylesheet)

If participants evaluate a saved page of your real app, you can pass its CSS via `theme`. The CSS **only** affects the evaluated interface, not the plugin or the rest of the study.

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: savedHtml,
  theme: myCss, // the complete CSS text as a string
};
```

How to get your app's HTML and CSS:

1. Open the app in the browser, right click → **Inspect**
2. In the Elements tab, right click `<body>` → **Copy → Copy outerHTML**, that's your `interface`
3. You'll find the CSS in the Network tab (filter: CSS) or in your app's build folder, that's your `theme`

Long texts are best kept in separate files, e.g. `screens.js`:

```js
// screens.js
const savedHtml = `...`;
const myCss = `...`;
```

and included **before** your experiment script: `<script src="screens.js"></script>`.

### 4.6 Changing the plugin's texts (e.g. to English)

The plugin's default texts are German. With `labels` you can replace each text individually. Anything you leave out keeps the default.

```js
const evaluation = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: myInterface,
  labels: {
    annotationTitle: "Annotation",
    annotationPlaceholder: "What do you notice about this element?",
    annotationHeuristic: "Heuristic",
    annotationHeuristicPlaceholder: "Please select...",
    cancel: "Cancel",
    save: "Save",
    heuristicsTitle: "Heuristics",
    heuristicNotePlaceholder: "General note on this heuristic...",
    heuristicDone: "Done",
    finish: "Finish",
  },
};
```

`labels` only changes the plugin's own texts. Write your interface, heuristics and scale directly in the language you want.

### 4.7 Interface Building

Participants drag blocks from the sidebar onto the canvas.

```js
const building = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Interface Building",
  components: ["button-primary", "input", "checkbox", "card"], // optional, if left out: all blocks
  screenshot: true, // optional, saves an image of the result
};
```

**Available blocks (`components`):**

| Category | IDs |
|---|---|
| Actions | `button-primary`, `button-secondary`, `button-outline`, `button-ghost`, `button-destructive`, `toggle`, `badge-default`, `badge-secondary`, `badge-outline`, `badge-destructive` |
| Form | `input`, `textarea`, `label`, `checkbox`, `radio-group`, `switch`, `slider`, `select` |
| Layout | `accordion`, `card`, `separator`, `tabs`, `scroll-area`, `resizable` |
| Feedback | `alert-default`, `alert-destructive`, `progress`, `skeleton`, `tooltip` |
| Overlay | `dialog`, `sheet`, `dropdown-menu`, `menubar` |

> Note: misspelled IDs are ignored without an error message. If a block is missing, check the spelling.

### 4.8 Several trials in a row

You can use the plugin as often as you like in one study, e.g. an introduction first and then two evaluations:

```js
const intro = {
  type: jsPsychHtmlButtonResponse, // needs the @jspsych/plugin-html-button-response plugin
  stimulus: "<p>You'll see two interfaces next. Please evaluate them.</p>",
  choices: ["Let's go"],
};

jsPsych.run([intro, evaluationA, evaluationB]);
```

For `jsPsychHtmlButtonResponse` also load this in the `<head>`:

```html
<script src="https://unpkg.com/@jspsych/plugin-html-button-response@2"></script>
```

---

## 5. Saving and understanding the data

### Saving

In the example above, `localSave` downloads a JSON file at the end. For real online studies use your platform's saving mechanism instead (e.g. JATOS, Pavlovia, Cognition). See the [jsPsych docs on data](https://www.jspsych.org/latest/overview/data/).

To save as a table (CSV):

```js
jsPsych.data.get().localSave("csv", "results.csv");
```

JSON is usually better here though, because the annotations are nested.

### What's in the data?

A trial in Annotation mode (using the interface from step 3, with heuristics and severity) returns something like:

```json
{
  "annotations": {
    "n1": {
      "button-4": { "annotationText": "No feedback after clicking", "heuristicId": "n1", "severity": 3 }
    },
    "n2": {
      "h1-1": { "annotationText": "Unclear wording", "heuristicId": "n2", "severity": 1 }
    }
  },
  "heuristicNotes": {
    "n1": "Feedback is often missing overall"
  },
  "events": [
    { "action": "annotate", "instanceId": "button-4", "text": "No feedback after clicking", "heuristicId": "n1", "severity": 3, "t": 1727600000000 }
  ],
  "components": [],
  "rt": 84213
}
```

How to read it:

| Field | Meaning |
|---|---|
| `annotations` | All notes, grouped by heuristic `id`. Without heuristics the group is called `"__none__"`. |
| Element ID (e.g. `button-4`) | HTML tag + position of the element on the page. **All** elements are counted from top to bottom, starting at 0. In step 3, `div` = 0, `h1` = 1, `p` = 2, `input` = 3, `button` = 4. With multiple screens there is a prefix, e.g. `s2:button-4`. As long as you don't change the HTML, the IDs stay the same. |
| `heuristicNotes` | General notes per heuristic (saved with **Done**). |
| `events` | Log of all actions with a timestamp `t` (milliseconds). Notes that were edited later are listed here too. |
| `components` | Interface Building only: placed blocks with their position `x`, `y`. |
| `screenshot` | Only with `screenshot: true`: the image as Base64 text. You can turn it back into an image e.g. on [base64.guru](https://base64.guru/converter/decode/image). |
| `rt` | Trial duration in milliseconds (added by jsPsych). |

---

## 6. All parameters at a glance

| Parameter | Mode | Required? | Description |
|---|---|---|---|
| `outputType` | both | no (default: `"Annotation"`) | `"Annotation"` or `"Interface Building"` |
| `interface` | Annotation | yes | HTML text or a list of HTML texts (one per screen) |
| `interface_labels` | Annotation | no | Tab names for multiple screens |
| `heuristic` | Annotation | no | List of `{ id, title, description }` |
| `severity_scale` | Annotation | no | `{ title, options: [{ value, label }, ...] }` |
| `theme` | Annotation | no | CSS text that only affects the interface |
| `components` | Interface Building | no | List of block IDs, if left out: all |
| `screenshot` | both | no (default: `false`) | Save an image of the result (makes the data much larger) |
| `labels` | both | no | Custom texts for the plugin's own UI |

---

## 7. Troubleshooting

**"jsPsychInterfaceEvaluator is not defined"**
The plugin wasn't loaded. Check:
- Is `index.browser.min.js` really in the same folder as `index.html`?
- Does the file name in `<script src="...">` match exactly?
- Is the plugin loaded **after** jsPsych?
- Did you run `npm run build`? Without a build the file doesn't exist.

**"initJsPsych is not defined"**
jsPsych wasn't loaded. Check your internet connection (jsPsych comes from unpkg.com) or load jsPsych locally.

**The page stays blank**
Open the developer tools (F12) and look at the **Console** tab. It almost always tells you what's wrong. Often it's a typo, e.g. a missing comma or a missing backtick (`` ` ``) at the end of the HTML text.

**"Save" is greyed out**
If heuristics or a severity scale are set, both must be selected in the dialog.

**My interface looks different from the original**
Pass your app's CSS via `theme` (see [4.5](#45-recreating-a-real-app-custom-stylesheet)). Images with relative paths (`src="image.png"`) must be reachable relative to your `index.html`.

**`npm install` fails with `Cannot read properties of null (reading 'edgesOut')`**
This happens when the plugin is installed as a local dependency in another project. Use `npm install --legacy-peer-deps`.

**`vitest` (or another command) is not found**
`node_modules` was installed on a different system. Delete the folder and run `npm install` again.

---

## 8. Advanced: using a bundler

If your experiment is built with Vite, Webpack or similar, you can add the plugin as a local dependency.

In your experiment's `package.json`:

```json
"dependencies": {
  "plugin-interface-evaluator": "file:../path/to/plugin-interface-evaluator"
}
```

```bash
npm install --legacy-peer-deps
```

Then in your code:

```js
import { initJsPsych } from "jspsych";
import jsPsychInterfaceEvaluator from "plugin-interface-evaluator";
```

In this case React is **not** bundled. Your project needs `react` and `react-dom` version 19 itself.

A complete, runnable example with all modes is in [`examples/index.html`](../examples/index.html).

---

*This guide was written with the help of Claude (Anthropic) and reviewed and edited by the author.*
