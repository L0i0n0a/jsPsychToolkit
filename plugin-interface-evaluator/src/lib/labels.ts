/** UI texts of the plugin itself, not of the annotated interface */
export type UiLabels = {
  /** Annotation dialog heading */
  annotationTitle: string
  /** Annotation dialog text field placeholder */
  annotationPlaceholder: string
  /** Heuristic dropdown label in the annotation dialog */
  annotationHeuristic: string
  /** Heuristic dropdown placeholder while nothing is chosen */
  annotationHeuristicPlaceholder: string
  cancel: string
  save: string
  /** Heuristic sidebar heading */
  heuristicsTitle: string
  /** Placeholder of the active heuristic's note field */
  heuristicNotePlaceholder: string
  /** Saves the note and jumps to the next heuristic */
  heuristicDone: string
  /** Ends the trial */
  finish: string
}

/** Defaults, any subset can be overridden via the plugin's `labels` parameter */
export const defaultLabels: UiLabels = {
  annotationTitle: "Annotation",
  annotationPlaceholder: "Was fällt dir an diesem Element auf?",
  annotationHeuristic: "Heuristik",
  annotationHeuristicPlaceholder: "Bitte auswählen...",
  cancel: "Abbrechen",
  save: "Speichern",
  heuristicsTitle: "Heuristiken",
  heuristicNotePlaceholder: "Allgemeine Notiz zu dieser Heuristik...",
  heuristicDone: "Fertig",
  finish: "Finish",
}
