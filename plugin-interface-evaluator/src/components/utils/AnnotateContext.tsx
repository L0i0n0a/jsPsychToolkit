import { createContext, useContext } from "react"
import { Annotation, Heuristic } from "../../lib/types"

export const AnnotationContext = createContext<{
  annotate: (id: string) => void
  annotations: Record<string, Annotation>
  heuristic?: Heuristic
  setHeuristic: (v: Heuristic | null) => void
  showText: boolean
  setShowText: (v: boolean) => void
} | null>(null)

export function useAnnotation() {
  const ctx = useContext(AnnotationContext)
  if (!ctx) throw new Error("useAnnotation must be used inside AnnotationProvider")
  return ctx
}

// Allows overriding showText for a subtree (e.g. per interface)
export const AnnotationShowTextContext = createContext<boolean | null>(null)
