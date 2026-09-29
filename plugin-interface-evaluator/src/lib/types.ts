export type Heuristic = {
  id: string
  title: string
  description: string
}

export type Annotation = {
    annotationText: string, 
    heuristicId?: string,
    /** Chosen severity value, only when a severity scale is configured */
    severity?: number
}

/** Optional severity rating shown in the annotation dialog */
export type SeverityScale = {
  title: string
  options: { value: number; label: string }[]
}