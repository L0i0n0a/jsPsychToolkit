// Lists the available components by category, dropping one onto the canvas creates a new instance
import { COMPONENT_LIBRARY, type ComponentItem } from "../component-library"
import { useDraggable } from "@dnd-kit/react"

// Draggable sidebar entry, data.source="sidebar" lets DragMonitor tell it apart from canvas moves
function SidebarItem({ item }: { item: ComponentItem }) {
  const { ref, isDragSource } = useDraggable({
    id: `${item.id}`,
    data: { source: "sidebar", registryId: item.id },
  })

  return (
    <div ref={ref} className={`p-4 m-2 border rounded-md ${isDragSource ? "opacity-30" : ""}`}>
      <p>{item.label}</p>
      <div className="pointer-events-none">{item.preview()}</div>
    </div>
  )
}

export default function Sidebar({ components }: { components?: (string | ComponentItem)[] }) {
  // Resolve each entry: string → lookup in library, object → use directly
  const resolved: ComponentItem[] = components
    ? components
        .map(c => typeof c === "string"
          ? COMPONENT_LIBRARY.find(item => item.id === c)
          : c
        )
        .filter((c): c is ComponentItem => c !== undefined) // drop unknown IDs
    : COMPONENT_LIBRARY                                     // nothing given → show all

  // Group resolved items by category for display
  const grouped = Object.entries(
    resolved.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, ComponentItem[]>)
  )

  return (
    <div className="flex flex-col h-full overflow-scroll border rounded-md p-2 w-90">
      <div className="text-2xl font-semibold">
        <h2>Components</h2>
      </div>
      <div>
        {grouped.map(([category, items]) => (
          <div key={category}>
            <div className="border rounded-md p-2 m-2 text-lg">{category}
              <div className="text-base">
                {items.map((item) => (
                  <SidebarItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}