# Anleitung: plugin-interface-evaluator einbinden

*English version: [GUIDE.md](GUIDE.md)*

Diese Anleitung richtet sich an alle, die das Plugin in eine eigene jsPsych-Studie einbauen wollen, auch ohne viel Programmiererfahrung. Du brauchst nur einen Texteditor, einen Browser und einmalig Node.js.

## Inhalt

1. [Was macht das Plugin?](#1-was-macht-das-plugin)
2. [Einmalig: Plugin bauen](#2-einmalig-plugin-bauen)
3. [Dein erstes Experiment in 5 Minuten](#3-dein-erstes-experiment-in-5-minuten)
4. [Beispiele zum Kopieren](#4-beispiele-zum-kopieren)
5. [Daten speichern und verstehen](#5-daten-speichern-und-verstehen)
6. [Alle Parameter auf einen Blick](#6-alle-parameter-auf-einen-blick)
7. [Häufige Probleme](#7-häufige-probleme)
8. [Für Fortgeschrittene: Einbindung mit Bundler](#8-für-fortgeschrittene-einbindung-mit-bundler)

---

## 1. Was macht das Plugin?

Das Plugin hat zwei Modi:

| Modus | Was sehen die Teilnehmenden? | Wofür? |
|---|---|---|
| **Annotation** | Eine fertige Oberfläche (z. B. ein Screenshot deiner App als HTML). Sie klicken auf Elemente und schreiben Notizen dazu. | Usability-Bewertungen, heuristische Evaluation |
| **Interface Building** | Eine leere Fläche und eine Seitenleiste mit Bausteinen (Buttons, Eingabefelder, …). Sie ziehen Bausteine auf die Fläche. | Teilnehmende entwerfen selbst eine Oberfläche |

Im Annotation-Modus kannst du zusätzlich:

- eine **Heuristik-Liste** anzeigen (z. B. Nielsens 10 Heuristiken)
- eine **Schweregrad-Skala** abfragen (z. B. 0 bis 4)
- **mehrere Screens** mit Tabs anzeigen
- das **Original-Stylesheet** deiner App mitgeben, damit alles echt aussieht

---

## 2. Einmalig: Plugin bauen

Das Plugin ist nicht auf npm veröffentlicht. Du musst es einmal selbst "bauen". Dabei entsteht eine einzige Datei, die du in dein Experiment einbindest.

**Voraussetzung:** [Node.js](https://nodejs.org) (Version 18 oder neuer) ist installiert. Prüfen kannst du das im Terminal mit `node -v`.

Öffne ein Terminal (Windows: PowerShell) im Ordner `plugin-interface-evaluator` und führe aus:

```bash
npm install
npm run build
```

Danach gibt es die Datei:

```
plugin-interface-evaluator/dist/index.browser.min.js
```

Das ist das komplette Plugin (React ist schon enthalten). Mehr brauchst du nicht.

> **Tipp:** Wenn du `node_modules` von einem anderen Rechner oder aus WSL kopiert hast, lösch den Ordner und führe `npm install` neu aus. Sonst fehlen die passenden Programme für dein Betriebssystem.

---

## 3. Dein erstes Experiment in 5 Minuten

### Schritt 1: Ordner anlegen

Leg einen neuen Ordner für deine Studie an und kopier die gebaute Datei `dist/index.browser.min.js` hinein:

```
meine-studie/
├── index.html
└── index.browser.min.js     ← Kopie aus plugin-interface-evaluator/dist/
```

### Schritt 2: `index.html` anlegen

Kopier diesen Inhalt komplett in `index.html`:

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <title>Meine Studie</title>

    <!-- 1. jsPsych laden -->
    <script src="https://unpkg.com/jspsych@8/dist/index.browser.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/jspsych@8/css/jspsych.css" />

    <!-- 2. Das Plugin laden (muss NACH jsPsych kommen) -->
    <script src="index.browser.min.js"></script>
  </head>
  <body></body>

  <script>
    // 3. jsPsych starten
    const jsPsych = initJsPsych({
      on_finish: () => {
        // Am Ende werden alle Daten als Datei heruntergeladen
        jsPsych.data.get().localSave("json", "ergebnisse.json");
      },
    });

    // 4. Die Oberfläche, die bewertet werden soll (ganz normales HTML)
    const meineOberflaeche = `
      <div style="padding: 24px; font-family: sans-serif;">
        <h1>Willkommen</h1>
        <p>Bitte melde dich an.</p>
        <input type="text" placeholder="E-Mail" />
        <button>Anmelden</button>
      </div>
    `;

    // 5. Der Trial mit dem Plugin
    const bewertung = {
      type: jsPsychInterfaceEvaluator,
      outputType: "Annotation",
      interface: meineOberflaeche,
    };

    // 6. Experiment starten
    jsPsych.run([bewertung]);
  </script>
</html>
```

### Schritt 3: Öffnen

Doppelklick auf `index.html`, fertig. Klick auf ein Element (z. B. den Button), schreib eine Notiz, speichere sie und klick unten auf **Finish**. Danach lädt der Browser `ergebnisse.json` herunter.

> Falls der Doppelklick nicht funktioniert, starte einen kleinen lokalen Server im Studienordner: `npx serve .` und öffne die angezeigte Adresse (meist `http://localhost:3000`).

---

## 4. Beispiele zum Kopieren

Alle Beispiele ersetzen nur den Teil `const bewertung = { ... }` aus Schritt 3. Der Rest der Datei bleibt gleich.

### 4.1 Einfache Annotation

Teilnehmende klicken auf Elemente und schreiben freie Notizen.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: `<div><h1>Titel</h1><button>Klick mich</button></div>`,
};
```

### 4.2 Mit Heuristiken (z. B. Nielsen)

Rechts erscheint eine Liste mit Heuristiken. Die Teilnehmenden wählen eine Heuristik aus und annotieren dann Elemente dazu. Zu jeder Heuristik können sie außerdem eine allgemeine Notiz schreiben und mit **Fertig** zur nächsten springen.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: meineOberflaeche,
  heuristic: [
    { id: "n1", title: "1 Sichtbarkeit des Systemstatus", description: "Das System informiert jederzeit darüber, was gerade passiert." },
    { id: "n2", title: "2 Übereinstimmung mit der realen Welt", description: "Das System spricht die Sprache der Nutzenden." },
    { id: "n3", title: "3 Kontrolle und Freiheit", description: "Es gibt klar erkennbare Notausgänge, z. B. Abbrechen oder Rückgängig." },
    // ... beliebig viele weitere
  ],
};
```

**Wichtig:**

- Jede Heuristik braucht eine eindeutige `id`. Unter dieser `id` findest du später die Daten.
- Sobald Heuristiken gesetzt sind, muss im Annotations-Dialog eine Heuristik gewählt sein, bevor gespeichert werden kann.

### 4.3 Mit Schweregrad-Skala

Im Annotations-Dialog erscheint zusätzlich eine Auswahl. Ohne Auswahl kann nicht gespeichert werden.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: meineOberflaeche,
  severity_scale: {
    title: "Schweregrad",
    options: [
      { value: 0, label: "0 Kein Problem" },
      { value: 1, label: "1 Kosmetisches Problem" },
      { value: 2, label: "2 Kleines Problem" },
      { value: 3, label: "3 Großes Problem" },
      { value: 4, label: "4 Katastrophe" },
    ],
  },
};
```

### 4.4 Mehrere Screens mit Tabs

Statt einem HTML-Text gibst du eine Liste (`[ ... ]`) an. Oben erscheinen Tabs zum Wechseln.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: [
    `<div><h1>Startseite</h1><button>Weiter</button></div>`,
    `<div><h1>Formular</h1><input placeholder="Name" /></div>`,
    `<div><h1>Bestätigung</h1><p>Danke!</p></div>`,
  ],
  interface_labels: ["Start", "Formular", "Bestätigung"], // optional, sonst nur "1", "2", "3"
};
```

In den Daten bekommen die Element-IDs dann ein Präfix pro Screen, z. B. `s1:h1-1` für die Überschrift auf Screen 1 und `s2:h1-1` für die auf Screen 2.

### 4.5 Echte App nachbilden (eigenes Stylesheet)

Wenn du eine gespeicherte Seite deiner echten App bewerten lässt, kannst du ihr CSS über `theme` mitgeben. Das CSS wirkt **nur** auf die bewertete Oberfläche, nicht auf das Plugin oder den Rest der Studie.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: gespeichertesHtml,
  theme: meinCss, // der komplette CSS-Text als String
};
```

So bekommst du HTML und CSS deiner App:

1. App im Browser öffnen, Rechtsklick → **Untersuchen**
2. Im Elements-Tab auf `<body>` Rechtsklick → **Copy → Copy outerHTML**, das ist dein `interface`
3. Das CSS findest du im Network-Tab (Filter: CSS) oder im Build-Ordner deiner App, das ist dein `theme`

Längere Texte legst du am besten in eigene Dateien, z. B. `screens.js`:

```js
// screens.js
const gespeichertesHtml = `...`;
const meinCss = `...`;
```

und bindest sie **vor** deinem Experiment-Skript ein: `<script src="screens.js"></script>`.

### 4.6 Plugin-Texte ändern (z. B. auf Englisch)

Die Standardtexte des Plugins sind Deutsch. Mit `labels` kannst du jeden Text einzeln ersetzen. Was du nicht angibst, bleibt beim Standard.

```js
const bewertung = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Annotation",
  interface: meineOberflaeche,
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

`labels` ändert nur die Texte des Plugins selbst. Deine Oberfläche, Heuristiken und Skala schreibst du direkt in der gewünschten Sprache.

### 4.7 Interface Building

Teilnehmende ziehen Bausteine aus der Seitenleiste auf die Fläche.

```js
const bauen = {
  type: jsPsychInterfaceEvaluator,
  outputType: "Interface Building",
  components: ["button-primary", "input", "checkbox", "card"], // optional, ohne Angabe: alle Bausteine
  screenshot: true, // optional, speichert ein Bild des Ergebnisses
};
```

**Verfügbare Bausteine (`components`):**

| Kategorie | IDs |
|---|---|
| Actions | `button-primary`, `button-secondary`, `button-outline`, `button-ghost`, `button-destructive`, `toggle`, `badge-default`, `badge-secondary`, `badge-outline`, `badge-destructive` |
| Form | `input`, `textarea`, `label`, `checkbox`, `radio-group`, `switch`, `slider`, `select` |
| Layout | `accordion`, `card`, `separator`, `tabs`, `scroll-area`, `resizable` |
| Feedback | `alert-default`, `alert-destructive`, `progress`, `skeleton`, `tooltip` |
| Overlay | `dialog`, `sheet`, `dropdown-menu`, `menubar` |

> Achtung: Falsch geschriebene IDs werden ohne Fehlermeldung ignoriert. Wenn ein Baustein fehlt, prüf die Schreibweise.

### 4.8 Mehrere Trials hintereinander

Du kannst das Plugin beliebig oft in einer Studie verwenden, z. B. erst eine Einleitung, dann zwei Bewertungen:

```js
const einleitung = {
  type: jsPsychHtmlButtonResponse, // braucht das Plugin @jspsych/plugin-html-button-response
  stimulus: "<p>Gleich siehst du zwei Oberflächen. Bitte bewerte sie.</p>",
  choices: ["Los geht's"],
};

jsPsych.run([einleitung, bewertungA, bewertungB]);
```

Für `jsPsychHtmlButtonResponse` musst du im `<head>` zusätzlich laden:

```html
<script src="https://unpkg.com/@jspsych/plugin-html-button-response@2"></script>
```

---

## 5. Daten speichern und verstehen

### Speichern

Im Beispiel oben lädt `localSave` am Ende eine JSON-Datei herunter. Für echte Online-Studien nutzt du stattdessen die Speicherfunktion deiner Plattform (z. B. JATOS, Pavlovia, Cognition). Siehe dazu die [jsPsych-Doku zum Speichern](https://www.jspsych.org/latest/overview/data/).

Als Tabelle (CSV) speichern:

```js
jsPsych.data.get().localSave("csv", "ergebnisse.csv");
```

JSON ist hier aber meist besser, weil die Annotationen verschachtelt sind.

### Was steht in den Daten?

Ein Trial im Annotation-Modus (mit der Oberfläche aus Schritt 3, Heuristiken und Schweregrad) liefert z. B.:

```json
{
  "annotations": {
    "n1": {
      "button-4": { "annotationText": "Kein Feedback nach dem Klick", "heuristicId": "n1", "severity": 3 }
    },
    "n2": {
      "h1-1": { "annotationText": "Begriff ist unklar", "heuristicId": "n2", "severity": 1 }
    }
  },
  "heuristicNotes": {
    "n1": "Insgesamt fehlt oft eine Rückmeldung"
  },
  "events": [
    { "action": "annotate", "instanceId": "button-4", "text": "Kein Feedback nach dem Klick", "heuristicId": "n1", "severity": 3, "t": 1727600000000 }
  ],
  "components": [],
  "rt": 84213
}
```

So liest du das:

| Feld | Bedeutung |
|---|---|
| `annotations` | Alle Notizen, gruppiert nach Heuristik-`id`. Ohne Heuristiken heißt die Gruppe `"__none__"`. |
| Element-ID (z. B. `button-4`) | HTML-Tag + Position des Elements in der Seite. Gezählt werden **alle** Elemente von oben nach unten, beginnend bei 0. In Schritt 3 ist `div` = 0, `h1` = 1, `p` = 2, `input` = 3, `button` = 4. Bei mehreren Screens mit Präfix, z. B. `s2:button-4`. Solange du das HTML nicht änderst, bleiben die IDs gleich. |
| `heuristicNotes` | Allgemeine Notizen pro Heuristik (werden mit **Fertig** gespeichert). |
| `events` | Protokoll aller Aktionen mit Zeitstempel `t` (Millisekunden). Auch Notizen, die später geändert wurden, stehen hier. |
| `components` | Nur beim Interface Building: platzierte Bausteine mit Position `x`, `y`. |
| `screenshot` | Nur mit `screenshot: true`: Bild als Base64-Text. Kann man z. B. auf [base64.guru](https://base64.guru/converter/decode/image) wieder in ein Bild umwandeln. |
| `rt` | Dauer des Trials in Millisekunden (kommt von jsPsych). |

---

## 6. Alle Parameter auf einen Blick

| Parameter | Modus | Pflicht? | Beschreibung |
|---|---|---|---|
| `outputType` | beide | nein (Standard: `"Annotation"`) | `"Annotation"` oder `"Interface Building"` |
| `interface` | Annotation | ja | HTML-Text oder Liste von HTML-Texten (ein Eintrag pro Screen) |
| `interface_labels` | Annotation | nein | Namen der Tabs bei mehreren Screens |
| `heuristic` | Annotation | nein | Liste von `{ id, title, description }` |
| `severity_scale` | Annotation | nein | `{ title, options: [{ value, label }, ...] }` |
| `theme` | Annotation | nein | CSS-Text, der nur auf die Oberfläche wirkt |
| `components` | Interface Building | nein | Liste von Baustein-IDs, ohne Angabe: alle |
| `screenshot` | beide | nein (Standard: `false`) | Bild des Ergebnisses speichern (macht die Daten deutlich größer) |
| `labels` | beide | nein | Eigene Texte für die Plugin-Oberfläche |

---

## 7. Häufige Probleme

**"jsPsychInterfaceEvaluator is not defined"**
Das Plugin wurde nicht geladen. Prüfe:
- Liegt `index.browser.min.js` wirklich im selben Ordner wie `index.html`?
- Stimmt der Dateiname im `<script src="...">` genau?
- Wird das Plugin **nach** jsPsych geladen?
- Hast du `npm run build` ausgeführt? Ohne Build gibt es die Datei nicht.

**"initJsPsych is not defined"**
jsPsych wurde nicht geladen. Prüfe die Internetverbindung (jsPsych kommt von unpkg.com) oder lade jsPsych lokal.

**Die Seite bleibt weiß**
Öffne die Entwicklertools (F12) und schau in den Tab **Console**. Dort steht fast immer, was fehlt. Häufig ist es ein Tippfehler, z. B. ein vergessenes Komma oder ein fehlendes Backtick (`` ` ``) am Ende des HTML-Texts.

**"Speichern" ist ausgegraut**
Wenn Heuristiken oder eine Schweregrad-Skala gesetzt sind, muss beides im Dialog ausgewählt sein.

**Meine Oberfläche sieht anders aus als im Original**
Gib das CSS deiner App über `theme` mit (siehe [4.5](#45-echte-app-nachbilden-eigenes-stylesheet)). Bilder mit relativen Pfaden (`src="bild.png"`) müssen relativ zu deiner `index.html` erreichbar sein.

**`npm install` bricht mit `Cannot read properties of null (reading 'edgesOut')` ab**
Das passiert, wenn das Plugin als lokale Abhängigkeit in einem anderen Projekt installiert wird. Nutze `npm install --legacy-peer-deps`.

**`"vitest" ist entweder falsch geschrieben oder konnte nicht gefunden werden`**
`node_modules` wurde auf einem anderen System installiert. Ordner löschen und `npm install` erneut ausführen.

---

## 8. Für Fortgeschrittene: Einbindung mit Bundler

Wenn dein Experiment mit Vite, Webpack o. Ä. gebaut wird, kannst du das Plugin als lokale Abhängigkeit einbinden.

In der `package.json` deines Experiments:

```json
"dependencies": {
  "plugin-interface-evaluator": "file:../pfad/zu/plugin-interface-evaluator"
}
```

```bash
npm install --legacy-peer-deps
```

Dann im Code:

```js
import { initJsPsych } from "jspsych";
import jsPsychInterfaceEvaluator from "plugin-interface-evaluator";
```

In diesem Fall wird React **nicht** mitgeliefert. Dein Projekt braucht selbst `react` und `react-dom` in Version 19.

Ein vollständiges, lauffähiges Beispiel mit allen Modi findest du in [`examples/index.html`](../examples/index.html).

---

*Diese Anleitung wurde mit Unterstützung von Claude (Anthropic) erstellt und von der Autorin geprüft und überarbeitet.*
