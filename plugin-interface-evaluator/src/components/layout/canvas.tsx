import { useDroppable, useDraggable } from "@dnd-kit/react"
import { COMPONENT_LIBRARY } from "../component-library"
import { StickyNote } from "lucide-react"
import { useAnnotation } from "../utils/AnnotateContext"

export type PlacedComponent = {
  instanceId: string
  registryId: string
  x: number
  y: number
  annotation?: string
}

function PlacedElement({ placed }: { placed: PlacedComponent }) {
  const { annotate, annotations } = useAnnotation()
  const hasAnnotation = !!annotations[placed.instanceId]

  const { ref, isDragSource } = useDraggable({
    id: placed.instanceId,
    data: { source: "canvas", instanceId: placed.instanceId },
  })

  const entry = COMPONENT_LIBRARY.find(
    (r: { id: string }) => r.id === placed.registryId
  )!

  return (
    <div
      ref={ref}
      className={`absolute ${isDragSource ? "opacity-40" : ""}`}
      style={{ left: placed.x, top: placed.y }}
    >
      {hasAnnotation && (
        <div className="text-xs bg-yellow-100 border border-yellow-300 rounded px-1 mb-1">
          {annotations[placed.instanceId]?.annotationText}
        </div>
      )}
      <div className="flex justify-end" onClick={() => annotate(placed.instanceId)}>
        <span className={`border rounded-sm bg-gray-200 hover:bg-yellow-400 ${hasAnnotation ? "bg-yellow-400 border-black" : ""}`}>
          <StickyNote size={14} />
        </span>
      </div>
      {/* pointer-events-none prevents the component's own handlers from blocking the drag */}
      <div className="pointer-events-none">{entry.render()}</div>
    </div>
  )
}

export function Canvas({ components }: { components: PlacedComponent[] }) {
  const { ref, isDropTarget } = useDroppable({ id: "canvas" })

  return (
    <div
      ref={ref}
      className={`h-full flex align-center justify-center border rounded-md ${
        isDropTarget
          ? "border-yellow-400 bg-yellow-50/20"
          : "border-dashed border-gray-400"
      }`}
    >
      {components.length === 0 && (
        <p className="h-full flex items-center text-gray-500">Komponenten hier hineinziehen</p>
      )}
      {components.map((p: PlacedComponent) => (
        <PlacedElement key={p.instanceId} placed={p} />
      ))}
    </div>
  )
}
