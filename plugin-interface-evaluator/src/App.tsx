import { DragDropProvider, useDragDropMonitor } from "@dnd-kit/react";
import React, { useRef, useState, type ReactElement, type RefObject } from "react";
import { Canvas, type PlacedComponent } from "./components/layout/canvas";
import Sidebar from "./components/layout/sidebar";
import AnnotationProvider, { ShowAnnotationText } from "./components/utils/AnnotationProvider";
import { ComponentItem } from "./components/component-library";
import { toJpeg } from "html-to-image";
import parse, { attributesToProps, domToReact, type DOMNode, type Element } from "html-react-parser";
import AnnotateWrapper from "./components/utils/AnnotateWrapper";
import { Annotation, Heuristic } from "./lib/types";
import HeuristicSidebar from "./components/layout/heuristic-sidebar";

// Must live inside <DragDropProvider> to access the dnd-kit event bus.
// Returns null — no UI, only side-effects via useDragDropMonitor.
function DragMonitor({
  canvasRef,
  onDropFromSidebar,
  onMoveOnCanvas,
}: {
  canvasRef: RefObject<HTMLDivElement | null>;
  onDropFromSidebar: (registryId: string, x: number, y: number) => void;
  onMoveOnCanvas: (instanceId: string, dx: number, dy: number) => void;
}) {
  // Stores pointer position at drag-start so we can compute dx/dy for canvas moves.
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
};

export type InteractionEvent = DropEvent | MoveEvent | AnnotateEvent;

// HTML void elements cannot have children — React throws if you pass any
const VOID_ELEMENTS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

// Parses an HTML string and wraps every element with AnnotateWrapper.
// Each element gets a sticky-note icon — clicking it opens the annotation modal.
// idx is reset per parse call, giving each element a deterministic ID based on position.
function AnnotatableContent({ html }: { html: string }) {
  let idx = 0;
  const options = {
    replace(node: DOMNode) {
      if (node.type === "tag") {
        const el = node as Element;
        const id = `${el.name}-${idx++}`;
        const children = VOID_ELEMENTS.has(el.name)
          ? undefined
          : domToReact(el.children as DOMNode[], options);
        const originalElement = React.createElement(el.name, attributesToProps(el.attribs), children);
        return (
          <AnnotateWrapper componentID={id} key={id}>
            {originalElement}
          </AnnotateWrapper>
        );
      }
      return undefined;
    },
  };
  return (
    <ShowAnnotationText>
      <div className="flex-1 overflow-auto p-4">
        {parse(html, options)}
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
  allowedComponents,
  screenshotUI,
  heuristic
}: {
  onFinish: (data: FinishData) => void;
  outputType: "Annotation" | "Interface Building";
  interfaceContent?: ReactElement | string;
  allowedComponents?: (string | ComponentItem)[];
  screenshotUI?: boolean;
  heuristic?: Heuristic[]
}) {
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  // useRef instead of useState — appending events must not trigger re-renders.
  const events = useRef<InteractionEvent[]>([]);
  const [heuristicNoteText, setHeuristicNoteText] = useState<Record<string, string>>({});
  // useRef so updates from AnnotationProvider don't trigger re-renders.
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

  const handleAnnotationSave = (instanceId: string, text: string, heuristic?: string) => {
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
      heuristicId: heuristic
    });
  };

  const handleHeuristicNoteSave = (heuristicId: string, text: string) => {
    setHeuristicNoteText(prev => ({ ...prev, [heuristicId]: text }));
  };

  // async because toJpeg is async; we must await it before handing data to jsPsych.
  async function handleFinish() {
    let screenshot: string | undefined;
    if (screenshotUI && canvasRef.current) {
      screenshot = await toJpeg(canvasRef.current);
    }
    onFinish({ components, events: events.current, screenshot, heuristicNotes: heuristicNoteText, annotations: annotationsRef.current });
  }

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      {outputType == "Annotation" && (
        <AnnotationProvider onSave={handleAnnotationSave} onAnnotationsChange={(a) => { annotationsRef.current = a; }}>
          <div ref={canvasRef} className="flex flex-row flex-1 overflow-hidden gap-4 p-4">
            {typeof interfaceContent === "string"
              ? <AnnotatableContent html={interfaceContent} />
              : <div className="flex-1 overflow-auto">{interfaceContent}</div>
            }
            {heuristic && (
              <HeuristicSidebar heuristic={heuristic} onFinish={handleHeuristicNoteSave} />
            )}
          </div>
          

          <div className="p-4 border-t">
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Finish
            </button>
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
            <div className="p-4 border-t">
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Finish
              </button>
            </div>
          </AnnotationProvider>
        </DragDropProvider>
      )}
    </div>
  );
}
