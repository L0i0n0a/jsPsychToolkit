export type Heuristic = {
  id: string
  title: string
  description: string
}

export type Annotation = {
    annotationText: string, 
    heuristicId?: string
}