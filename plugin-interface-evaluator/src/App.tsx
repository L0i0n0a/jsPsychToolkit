import { DragDropProvider, useDragDropMonitor } from "@dnd-kit/react";
import React, { useRef, useState, type ReactElement, type RefObject } from "react";
import { Canvas, type PlacedComponent } from "./components/layout/canvas";
import Sidebar from "./components/layout/sidebar";
import AnnotationProvider, { ShowAnnotationText } from "./components/utils/AnnotationProvider";
import { ComponentItem } from "./components/component-library";
import { toJpeg } from "html-to-image";
import AnnotatableScreen from "./components/utils/AnnotatableScreen";
import { Annotation, Heuristic, SeverityScale } from "./lib/types";
import HeuristicSidebar from "./components/layout/heuristic-sidebar";
import { Button } from "./components/ui/button";
import { LabelsContext } from "./components/utils/LabelsContext";
import { defaultLabels, type UiLabels } from "./lib/labels";

// Renders nothing, only listens to dnd-kit events, so it must live inside <DragDropProvider>
function DragMonitor({
  canvasRef,
  onDropFromSidebar,
  onMoveOnCanvas,
}: {
  canvasRef: RefObject<HTMLDivElement | null>;
  onDropFromSidebar: (registryId: string, x: number, y: number) => void;
  onMoveOnCanvas: (instanceId: string, dx: number, dy: number) => void;
}) {
  // Pointer position at drag start, used to compute dx/dy for canvas moves
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useDragDropMonitor({
    onDragStart(event) {
      startPos.current = {
        x: event.operation.position.current.x,
        y: event.operation.position.current.y,
      };
    },
    onDragEnd(event) {
      if (event.canceled) return;
      const { source, target, position } = event.operation;
      if (!target || target.id !== "canvas") return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const dropX = position.current.x - (canvasRect?.left ?? 0);
      const dropY = position.current.y - (canvasRect?.top ?? 0);

      const data = source?.data as any;

      if (data.source === "sidebar") {
        onDropFromSidebar(
          data.registryId,
          Math.max(0, dropX),
          Math.max(0, dropY),
        );
      } else if (data.source === "canvas") {
        const dx = position.current.x - (startPos.current?.x ?? 0);
        const dy = position.current.y - (startPos.current?.y ?? 0);
        onMoveOnCanvas(data.instanceId, dx, dy);
      }

      startPos.current = null;
    },
  });

  return null;
}
type DropEvent = {
  action: "drop";
  instanceId: string;
  registryId: string;
  x: number;
  y: number;
  t: number;
};

type MoveEvent = {
  action: "move";
  instanceId: string;
  dx: number;
  dy: number;
  t: number;
};

type AnnotateEvent = {
  action: "annotate";
  instanceId: string;
  t: number;
  text: string;
  heuristicId?: string;
  severity?: number;
};

export type InteractionEvent = DropEvent | MoveEvent | AnnotateEvent;

/*
 * One or more annotatable HTML snapshots
 * Multiple screens get tabs and a "s<n>:" id prefix so their annotations never collide
 */
function AnnotatableContent({ screens, labels, theme }: { screens: string[]; labels?: string[]; theme?: string }) {
  const [active, setActive] = useState(0);
  const multi = screens.length > 1;
  return (
    // Notes are hidden in the snapshot since long texts overflow, the marker icon is enough
    <ShowAnnotationText show={false}>
      <div className="flex min-h-[70vh] shrink-0 flex-col gap-2 md:min-h-0 md:min-w-0 md:flex-1 md:shrink">
        {multi && (
          <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto pb-1">
            {screens.map((_, i) => (
              <Button
                key={i}
                role="tab"
                aria-selected={i === active}
                size="sm"
                variant={i === active ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setActive(i)}
              >
                {i + 1}
                {labels?.[i] ? ` ${labels[i]}` : ""}
              </Button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-auto rounded-md border bg-background p-2 md:p-4">
          <AnnotatableScreen key={active} html={screens[active]} theme={theme} idPrefix={multi ? `s${active + 1}:` : ""} />
        </div>
      </div>
    </ShowAnnotationText>
  );
}

export type FinishData = {
  components: PlacedComponent[];
  events: InteractionEvent[];
  screenshot?: string; // base64 JPEG, only present when screenshotUI=true
  heuristicNotes?: Record<string, string>;
  annotations?: Record<string, Record<string, Annotation>>
};

export default function App({
  onFinish,
  outputType,
  interfaceContent,
  interfaceLabels,
  theme,
  allowedComponents,
  screenshotUI,
  heuristic,
  severityScale,
  labels
}: {
  onFinish: (data: FinishData) => void;
  outputType: "Annotation" | "Interface Building";
  interfaceContent?: ReactElement | string | string[];
  interfaceLabels?: string[];
  /** Stylesheet scoped to the interface snapshots, see AnnotatableScreen */
  theme?: string;
  allowedComponents?: (string | ComponentItem)[];
  screenshotUI?: boolean;
  heuristic?: Heuristic[]
  severityScale?: SeverityScale
  /** Overrides for the plugin's own UI texts, missing keys keep the defaults */
  labels?: Partial<UiLabels>
}) {
  const ui: UiLabels = { ...defaultLabels, ...labels };
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  // useRef so appending events doesn't trigger rerenders
  const events = useRef<InteractionEvent[]>([]);
  const [heuristicNoteText, setHeuristicNoteText] = useState<Record<string, string>>({});
  // useRef so updates from AnnotationProvider don't trigger rerenders
  const annotationsRef = useRef<Record<string, Record<string, Annotation>>>({});

  const handleDropFromSidebar = (registryId: string, x: number, y: number) => {
    const instanceId = `${registryId}--${Date.now()}`;
    setComponents((prev) => [...prev, { instanceId, registryId, x, y }]);
    events.current.push({
      action: "drop",
      instanceId,
      registryId,
      x,
      y,
      t: Date.now(),
    });
  };

  const handleMoveOnCanvas = (instanceId: string, dx: number, dy: number) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, x: c.x + dx, y: c.y + dy } : c,
      ),
    );
    events.current.push({ action: "move", instanceId, dx, dy, t: Date.now() });
  };

  const handleAnnotationSave = (instanceId: string, text: string, heuristic?: string, severity?: number) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, annotation: text } : c,
      ),
    );
    events.current.push({
      action: "annotate",
      instanceId,
      text,
      t: Date.now(),
      heuristicId: heuristic,
      ...(severity !== undefined ? { severity } : {}),
    });
  };

  const handleHeuristicNoteSave = (heuristicId: string, text: string) => {
    setHeuristicNoteText(prev => ({ ...prev, [heuristicId]: text }));
  };

  // async because toJpeg has to finish before the data goes to jsPsych
  async function handleFinish() {
    let screenshot: string | undefined;
    if (screenshotUI && canvasRef.current) {
      screenshot = await toJpeg(canvasRef.current);
    }
    onFinish({ components, events: events.current, screenshot, heuristicNotes: heuristicNoteText, annotations: annotationsRef.current });
  }

  return (
    <LabelsContext.Provider value={ui}>
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      {outputType == "Annotation" && (
        <AnnotationProvider onSave={handleAnnotationSave} onAnnotationsChange={(a) => { annotationsRef.current = a; }} severityScale={severityScale} heuristics={heuristic}>
          {/* Stacked below md, side by side above */}
          <div ref={canvasRef} className="mx-auto flex w-full max-w-[1800px] min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2 md:flex-row md:gap-4 md:overflow-hidden md:p-4">
            {typeof interfaceContent === "string" || Array.isArray(interfaceContent)
              ? <AnnotatableContent
                  screens={Array.isArray(interfaceContent) ? interfaceContent : [interfaceContent]}
                  labels={interfaceLabels}
                  theme={theme}
                />
              : <div className="flex-1 overflow-auto">{interfaceContent}</div>
            }
            {heuristic && (
              <HeuristicSidebar heuristic={heuristic} onFinish={handleHeuristicNoteSave} />
            )}
          </div>


          <div className="p-4 border-t flex justify-center">
            <Button onClick={handleFinish} size="lg">
              {ui.finish}
            </Button>
          </div>
        </AnnotationProvider>
      )}

      {outputType == "Interface Building" && (
        <DragDropProvider>
          <AnnotationProvider onSave={handleAnnotationSave}>
            <DragMonitor
              canvasRef={canvasRef}
              onDropFromSidebar={handleDropFromSidebar}
              onMoveOnCanvas={handleMoveOnCanvas}
            />
            <div className="flex flex-row flex-1 overflow-hidden p-4 gap-4">
              <div ref={canvasRef} className="relative flex-1 h-full">
                <Canvas components={components} />
              </div>
              <Sidebar components={allowedComponents} />
            </div>
            <div className="p-4 border-t flex justify-center">
              <Button onClick={handleFinish} size="lg">
                {ui.finish}
              </Button>
            </div>
          </AnnotationProvider>
        </DragDropProvider>
      )}
    </div>
    </LabelsContext.Provider>
  );
}
