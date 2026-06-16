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
  // Explicit prop takes priority over context — callers can override per-element.
  const showTextFinal = showText !== undefined ? showText : contextShowText

  const hasAnnotation = !!annotations[componentID]

  return (
    // inline-block keeps the wrapper tight around the child so the absolute icon
    // positions at the element's corner rather than stretching to full row width.
    <div className="relative group inline-block">
      {children}
      <span
        onClick={() => annotate(componentID)}
        className={`absolute top-0 right-0 -translate-y-full cursor-pointer border rounded-sm bg-gray-200 hover:bg-yellow-400 px-0.5 ${
          hasAnnotation ? "bg-yellow-400 border-black" : ""
        }`}
      >
        <StickyNote size={14} />
      </span>
      {showTextFinal && hasAnnotation && (
        <div className="absolute top-0 right-6 -translate-y-full max-w-48 text-xs bg-yellow-100 border border-yellow-300 rounded px-1.5 py-0.5 whitespace-pre-wrap z-10">
          {annotations[componentID]?.annotationText}
        </div>
      )}
    </div>
  )
}
