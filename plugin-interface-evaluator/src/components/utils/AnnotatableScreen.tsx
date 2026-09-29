import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"
import { StickyNote } from "lucide-react"
import { useAnnotation, AnnotationShowTextContext } from "./AnnotateContext"

type Box = { left: number; top: number; width: number; height: number }

const ID_ATTR = "data-annot-id"

/*
 * Renders an HTML snapshot unchanged and makes its elements annotatable via event delegation,
 * so the original layout keeps working; hover outline and markers are overlays on top
 * The snapshot and its `theme` live in a nested shadow root so its Tailwind classes
 * don't clash with the plugin's own
 * Element ids look like "h1-0" (tag and index in document order), optionally with `idPrefix`
 */
export default function AnnotatableScreen({
  html,
  theme,
  idPrefix = "",
}: {
  html: string
  /** CSS for the snapshot only, already made shadow safe in index.tsx */
  theme?: string
  idPrefix?: string
}) {
  const { annotate, annotations } = useAnnotation()
  const showText = useContext(AnnotationShowTextContext) ?? false
  const layerRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<Box | null>(null)
  const [marked, setMarked] = useState<{ id: string; box: Box; text: string }[]>([])
  // Root of the snapshot DOM inside the nested shadow root
  const snapRef = useRef<HTMLDivElement | null>(null)

  // Mount the snapshot and tag every element with its id, before paint and only when html, theme or prefix change
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" })
    shadow.replaceChildren()
    const style = document.createElement("style")
    style.textContent = theme ?? ""
    const snap = document.createElement("div")
    snap.innerHTML = html
    snap.querySelectorAll("*").forEach((el, i) => {
      el.setAttribute(ID_ATTR, `${idPrefix}${el.localName}-${i}`)
    })
    shadow.append(style, snap)
    snapRef.current = snap
    measureMarked()
  }, [html, theme, idPrefix])

  const boxOf = useCallback((el: Element): Box | null => {
    const layer = layerRef.current
    if (!layer) return null
    const l = layer.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return null
    return { left: r.left - l.left, top: r.top - l.top, width: r.width, height: r.height }
  }, [])

  const measureMarked = useCallback(() => {
    const snap = snapRef.current
    if (!snap) return
    const next: { id: string; box: Box; text: string }[] = []
    for (const [id, a] of Object.entries(annotations)) {
      const el = snap.querySelector(`[${ID_ATTR}="${CSS.escape(id)}"]`)
      const box = el && boxOf(el)
      if (box) next.push({ id, box, text: a.annotationText })
    }
    setMarked(next)
  }, [annotations, boxOf])

  useLayoutEffect(measureMarked, [measureMarked])

  // Remeasure on layout changes so markers stay on their elements
  useEffect(() => {
    const layer = layerRef.current
    if (!layer || typeof ResizeObserver === "undefined") return undefined
    const ro = new ResizeObserver(measureMarked)
    ro.observe(layer)
    return () => ro.disconnect()
  }, [measureMarked])

  // Element under the pointer, elementFromPoint also hits disabled controls unlike e.target
  const pick = (e: MouseEvent): Element | null => {
    const snap = snapRef.current
    const shadow = hostRef.current?.shadowRoot
    if (!snap || !shadow) return null
    // Events are retargeted to the shadow host, so ask the nested root, composedPath()[0] is the jsdom fallback
    let el = (shadow.elementFromPoint?.(e.clientX, e.clientY) ??
      (e.nativeEvent.composedPath?.()[0] as Element | undefined)) as Element | null | undefined
    if (!el || el === snap || !snap.contains(el)) return null
    // SVG internals (path, g, ...) are icon detail
    const svg = el.closest("svg")
    if (svg && snap.contains(svg)) el = svg
    return el
  }

  return (
    <div ref={layerRef} className="relative">
      <div
        ref={hostRef}
        // no focus, no text entry, no navigation
        onMouseDownCapture={(e) => e.preventDefault()}
        onClickCapture={(e) => e.preventDefault()}
        onMouseMove={(e) => {
          const el = pick(e)
          setHover(el ? boxOf(el) : null)
        }}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => {
          const id = pick(e)?.getAttribute(ID_ATTR)
          if (id) annotate(id)
        }}
        className="cursor-pointer"
      />
      <div className="pointer-events-none absolute inset-0">
        {marked.map(({ id, box, text }) => (
          <div key={id} className="absolute rounded-sm border-2 border-primary" style={box}>
            <span
              title={text}
              className="absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
            >
              <StickyNote size={12} />
            </span>
            {showText && text && (
              <div className="absolute left-0 top-full z-10 mt-1 max-w-48 whitespace-pre-wrap rounded border border-primary/30 bg-card px-1.5 py-0.5 text-xs text-card-foreground shadow">
                {text}
              </div>
            )}
          </div>
        ))}
        {hover && (
          <div
            className="absolute rounded-sm border-2 border-primary/60 bg-primary/10"
            style={hover}
          />
        )}
      </div>
    </div>
  )
}
