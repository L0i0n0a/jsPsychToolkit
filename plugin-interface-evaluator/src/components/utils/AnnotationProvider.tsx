import { useState, type ReactNode } from "react";
import {
  AnnotationContext,
  AnnotationShowTextContext,
} from "./AnnotateContext";
import AnnotationModal from "../ui/AnnotationModal";
import { Annotation, Heuristic, SeverityScale } from "../../lib/types";

export default function AnnotationProvider({
  children,
  onSave,
  onAnnotationsChange,
  severityScale,
  heuristics,
}: {
  children: ReactNode;
  onSave?: (id: string, text: string, heuristic?: string, severity?: number) => void;
  severityScale?: SeverityScale;
  /** Heuristics offered in the annotation dialog's dropdown */
  heuristics?: Heuristic[];
  onAnnotationsChange?: (annotations: Record<string, Record<string, Annotation>>) => void;
}) {
  const [annotations, setAnnotations] = useState<
    Record<string, Record<string, Annotation>>
  >({});
  const [heuristic, setHeuristic] = useState<Heuristic | null>(null);
  // ID of the element being annotated, tells the modal what to prefill and where to save
  const [annotating, setAnnotating] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);

  // Heuristic the dialog was opened with, so a changed heuristic moves the entry instead of copying it
  const [originKey, setOriginKey] = useState<string>("__none__");

  const annotate = (id: string) => {
    setOriginKey(heuristic?.id ?? "__none__");
    setAnnotating(id);
  };

  const handleSave = (text: string, severity?: number) => {
    if (!annotating) return;
    const key = heuristic?.id ?? "__none__";
    const next: Record<string, Record<string, Annotation>> = {
      ...annotations,
      [key]: {
        ...(annotations[key] ?? {}),
        [annotating]: { annotationText: text, heuristicId: heuristic?.id, ...(severity !== undefined ? { severity } : {}) },
      },
    };
    if (originKey !== key && annotations[originKey]?.[annotating]) {
      const { [annotating]: _moved, ...rest } = annotations[originKey];
      next[originKey] = rest;
    }
    setAnnotations(next);
    onAnnotationsChange?.(next);
    onSave?.(annotating, text, heuristic?.id, severity);
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
            initialSeverity={currentAnnotations[annotating]?.severity}
            severityScale={severityScale}
            heuristics={heuristics}
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
