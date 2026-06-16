import { useState, type ReactNode } from "react";
import {
  AnnotationContext,
  AnnotationShowTextContext,
} from "./AnnotateContext";
import AnnotationModal from "../ui/AnnotationModal";
import { Annotation, Heuristic } from "../../lib/types";

export default function AnnotationProvider({
  children,
  onSave,
  onAnnotationsChange,
}: {
  children: ReactNode;
  onSave?: (id: string, text: string, heuristic?: string) => void;
  onAnnotationsChange?: (annotations: Record<string, Record<string, Annotation>>) => void;
}) {
  const [annotations, setAnnotations] = useState<
    Record<string, Record<string, Annotation>>
  >({});
  const [heuristic, setHeuristic] = useState<Heuristic | null>(null);
  // Stores the component ID being annotated (not just a boolean) so the modal
  // knows which entry to pre-fill and which key to write the saved text to.
  const [annotating, setAnnotating] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);

  const annotate = (id: string) => setAnnotating(id);

  const handleSave = (text: string) => {
    if (!annotating) return;
    const key = heuristic?.id ?? "__none__";
    const next = {
      ...annotations,
      [key]: {
        ...(annotations[key] ?? {}),
        [annotating]: { annotationText: text, heuristicId: heuristic?.id },
      },
    };
    setAnnotations(next);
    onAnnotationsChange?.(next);
    onSave?.(annotating, text, heuristic?.id);
    setAnnotating(null);
  };

  const currentAnnotations: Record<string, Annotation> = annotations[heuristic?.id ?? "__none__"] ?? {}


  return (
    <AnnotationContext.Provider
      value={{
        annotate,
        annotations: currentAnnotations,
        showText,
        setShowText,
        heuristic,
        setHeuristic,
      }}
    >
      <AnnotationShowTextContext.Provider value={showText}>
        {children}
        {annotating && (
          <AnnotationModal
            initialText={currentAnnotations[annotating]?.annotationText ?? ""}
            onSave={handleSave}
            onClose={() => setAnnotating(null)}
          />
        )}
      </AnnotationShowTextContext.Provider>
    </AnnotationContext.Provider>
  );
}

// Wrap a subtree to override showText locally (e.g. per interface)
export function ShowAnnotationText({
  children,
  show = true,
}: {
  children: ReactNode;
  show?: boolean;
}) {
  return (
    <AnnotationShowTextContext.Provider value={show}>
      {children}
    </AnnotationShowTextContext.Provider>
  );
}
