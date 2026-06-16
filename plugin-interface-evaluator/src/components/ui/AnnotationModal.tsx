import { useState } from "react"

export default function AnnotationModal({
  initialText,
  onSave,
  onClose,
}: {
  initialText: string
  onSave: (text: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState(initialText)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-3 text-sm font-medium">Annotation</h3>
        <textarea
          autoFocus
          className="h-28 w-full resize-none rounded-lg border p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Was fällt dir an diesem Element auf?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-500"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onSave(text)}
            className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
