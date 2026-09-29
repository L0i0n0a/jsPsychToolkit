import { useContext, type ReactNode } from "react"
import { StickyNote } from "lucide-react"
import { useAnnotation, AnnotationShowTextContext } from "./AnnotateContext"

export default function AnnotateWrapper({
  componentID,
  children,
  showText,
}: {
  componentID: string
  children: ReactNode
  showText?: boolean
}) {
  const { annotate, annotations } = useAnnotation()
  const contextShowText = useContext(AnnotationShowTextContext) ?? false
  // The prop overrides the context value
  const showTextFinal = showText !== undefined ? showText : contextShowText

  const hasAnnotation = !!annotations[componentID]

  return (
    // inline-block keeps the wrapper tight so the icon sits at the element's corner
    <div className="relative group inline-block">
      {children}
      <span
        onClick={() => annotate(componentID)}
        className={`absolute top-0 right-0 -translate-y-full cursor-pointer border rounded-sm bg-gray-200 hover:bg-primary hover:text-primary-foreground px-0.5 transition-opacity ${
          hasAnnotation
            ? "bg-primary text-primary-foreground border-primary opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <StickyNote size={14} />
      </span>
      {showTextFinal && hasAnnotation && (
        <div className="absolute top-0 right-6 -translate-y-full max-w-48 text-xs bg-accent text-accent-foreground border border-primary/30 rounded px-1.5 py-0.5 whitespace-pre-wrap z-10">
          {annotations[componentID]?.annotationText}
        </div>
      )}
    </div>
  )
}
