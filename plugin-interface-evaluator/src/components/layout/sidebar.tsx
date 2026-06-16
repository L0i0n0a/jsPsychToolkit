// Sidebar: lists all available UI components, grouped by category.
// Each item is draggable — dropping it onto the canvas creates a new instance.
import { COMPONENT_LIBRARY, type ComponentItem } from "../component-library"
import { useDraggable } from "@dnd-kit/react"

// A single draggable entry in the sidebar.
// data.source="sidebar" lets DragMonitor distinguish sidebar drags from canvas moves.
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
          ? COMPONENT_LIBRARY.find(item => item.id === c)  // ID → suche in Bibliothek
          : c                                               // Objekt → direkt verwenden
        )
        .filter((c): c is ComponentItem => c !== undefined) // nicht gefundene IDs entfernen
    : COMPONENT_LIBRARY                                     // nichts angegeben → alles zeigen

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