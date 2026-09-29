import { useState } from "react"
import { Button } from "./button"
import { Textarea } from "./textarea"
import type { Heuristic, SeverityScale } from "../../lib/types"
import { useLabels } from "../utils/LabelsContext"
import { useAnnotation } from "../utils/AnnotateContext"

export default function AnnotationModal({
  initialText,
  initialSeverity,
  severityScale,
  heuristics,
  onSave,
  onClose,
}: {
  initialText: string
  initialSeverity?: number
  severityScale?: SeverityScale
  /** If given, the dialog shows a dropdown to pick or change the heuristic */
  heuristics?: Heuristic[]
  onSave: (text: string, severity?: number) => void
  onClose: () => void
}) {
  const labels = useLabels()
  const { heuristic, setHeuristic } = useAnnotation()
  const [text, setText] = useState(initialText)
  const [severity, setSeverity] = useState<number | undefined>(initialSeverity)
  // Severity and heuristic are required before saving if they are configured
  const canSave = (!severityScale || severity !== undefined) && (!heuristics?.length || !!heuristic)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
      <div className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl">
        <h3 className="mb-3 text-sm font-medium">{labels.annotationTitle}</h3>
        <Textarea
          autoFocus
          className="h-28"
          placeholder={labels.annotationPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {heuristics && heuristics.length > 0 && (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-medium">{labels.annotationHeuristic}</span>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              value={heuristic?.id ?? ""}
              onChange={(e) => setHeuristic(heuristics.find((h) => h.id === e.target.value) ?? null)}
            >
              <option value="" disabled>
                {labels.annotationHeuristicPlaceholder}
              </option>
              {heuristics.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {severityScale && (
          <fieldset className="mt-3">
            <legend className="mb-1.5 text-sm font-medium">{severityScale.title}</legend>
            <div role="radiogroup" className="flex flex-col gap-1.5">
              {severityScale.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={severity === o.value}
                  onClick={() => setSeverity(o.value)}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm ${
                    severity === o.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      severity === o.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {o.value}
                  </span>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button disabled={!canSave} onClick={() => onSave(text, severity)}>
            {labels.save}
          </Button>
        </div>
      </div>
    </div>
  )
}
