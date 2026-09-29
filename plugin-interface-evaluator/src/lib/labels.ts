/** UI texts of the plugin itself (not the interface being annotated). */
export type UiLabels = {
  /** Heading of the annotation dialog. */
  annotationTitle: string
  /** Placeholder of the annotation dialog's text field. */
  annotationPlaceholder: string
  /** Label of the heuristic dropdown in the annotation dialog. */
  annotationHeuristic: string
  /** Placeholder option of that dropdown while no heuristic is chosen. */
  annotationHeuristicPlaceholder: string
  cancel: string
  save: string
  /** Heading of the heuristic sidebar. */
  heuristicsTitle: string
  /** Placeholder of the general-note field of the active heuristic. */
  heuristicNotePlaceholder: string
  /** Button that saves the general note and jumps to the next heuristic. */
  heuristicDone: string
  /** Button that ends the trial. */
  finish: string
}

/** Defaults; override any subset via the plugin's `labels` parameter. */
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
