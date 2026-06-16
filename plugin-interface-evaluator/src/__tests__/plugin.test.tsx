import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App, { FinishData } from "../App";
import AnnotateWrapper from "../components/utils/AnnotateWrapper";
import AnnotationProvider from "../components/utils/AnnotationProvider";
import HeuristicSidebar from "../components/layout/heuristic-sidebar";
import { Heuristic } from "../lib/types";

const HEURISTICS: Heuristic[] = [
  { id: "h1", title: "Sichtbarkeit des Systemstatus", description: "Beschreibung 1" },
  { id: "h2", title: "Übereinstimmung mit der Welt", description: "Beschreibung 2" },
];

// ─── Annotation mode (HTML-String) ───────────────────────────────────────────

describe("App – Annotation mode (HTML-String)", () => {
  it("zeigt den Finish-Button", () => {
    render(<App onFinish={() => {}} outputType="Annotation" />);
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("rendert HTML-String korrekt als echtes HTML", () => {
    render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        interfaceContent="<h1>Mein Interface</h1>"
      />
    );
    expect(screen.getByText("Mein Interface")).toBeInTheDocument();
  });

  it("onFinish enthält leere components, events, annotations und heuristicNotes", async () => {
    const onFinish = vi.fn();
    render(<App onFinish={onFinish} outputType="Annotation" />);
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining<Partial<FinishData>>({
          components: [],
          events: [],
          annotations: {},
          heuristicNotes: {},
        })
      );
    });
  });

  it("onFinish enthält kein screenshot ohne screenshotUI", async () => {
    const onFinish = vi.fn();
    render(<App onFinish={onFinish} outputType="Annotation" />);
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => {
      const data = onFinish.mock.calls[0][0] as FinishData;
      expect(data.screenshot).toBeUndefined();
    });
  });
});

// ─── Annotation mode (React-Element) ─────────────────────────────────────────

describe("App – Annotation mode (React-Element)", () => {
  it("rendert ein übergebenes React-Element mit AnnotateWrapper", () => {
    const TestInterface = () => (
      <div>
        <AnnotateWrapper componentID="test-btn">
          <button>Annotierbar</button>
        </AnnotateWrapper>
      </div>
    );
    render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        interfaceContent={<TestInterface />}
      />
    );
    expect(screen.getByText("Annotierbar")).toBeInTheDocument();
  });
});

// ─── Annotation mode mit Heuristiken ─────────────────────────────────────────

describe("App – Annotation mode mit Heuristiken", () => {
  it("zeigt HeuristicSidebar wenn heuristic-Prop gesetzt ist", () => {
    render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        heuristic={HEURISTICS}
      />
    );
    expect(screen.getByText("Sichtbarkeit des Systemstatus")).toBeInTheDocument();
    expect(screen.getByText("Übereinstimmung mit der Welt")).toBeInTheDocument();
  });

  it("zeigt keine HeuristicSidebar ohne heuristic-Prop", () => {
    render(<App onFinish={() => {}} outputType="Annotation" />);
    expect(screen.queryByText("Sichtbarkeit des Systemstatus")).not.toBeInTheDocument();
  });

  it("onFinish enthält heuristicNotes als leeres Objekt wenn keine Notizen gemacht wurden", async () => {
    const onFinish = vi.fn();
    render(
      <App onFinish={onFinish} outputType="Annotation" heuristic={HEURISTICS} />
    );
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => {
      const data = onFinish.mock.calls[0][0] as FinishData;
      expect(data.heuristicNotes).toEqual({});
    });
  });
});

// ─── HeuristicSidebar ────────────────────────────────────────────────────────

describe("HeuristicSidebar", () => {
  const renderInProvider = (onFinish = vi.fn()) =>
    render(
      <AnnotationProvider>
        <HeuristicSidebar heuristic={HEURISTICS} onFinish={onFinish} />
      </AnnotationProvider>
    );

  it("zeigt alle Heuristik-Titel", () => {
    renderInProvider();
    expect(screen.getByText("Sichtbarkeit des Systemstatus")).toBeInTheDocument();
    expect(screen.getByText("Übereinstimmung mit der Welt")).toBeInTheDocument();
  });

  it("zeigt Textarea und Finish-Button wenn Heuristik aktiv ist", () => {
    renderInProvider();
    fireEvent.click(screen.getByText("Sichtbarkeit des Systemstatus"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText("Fertig")).toBeInTheDocument();
  });

  it("ruft onFinish mit heuristicId und Textinhalt auf", () => {
    const onFinish = vi.fn();
    renderInProvider(onFinish);
    fireEvent.click(screen.getByText("Sichtbarkeit des Systemstatus"));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Kritisch" } });
    fireEvent.click(screen.getByText("Fertig"));
    expect(onFinish).toHaveBeenCalledWith("h1", "Kritisch");
  });

  it("setzt nach Fertig die nächste Heuristik aktiv", () => {
    renderInProvider();
    fireEvent.click(screen.getByText("Sichtbarkeit des Systemstatus"));
    fireEvent.click(screen.getByText("Fertig"));
    // Nach Fertig sollte h2 aktiv sein → Textarea und Fertig-Button für h2 sichtbar
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });
});

// ─── AnnotationProvider ───────────────────────────────────────────────────────

describe("AnnotationProvider – onAnnotationsChange", () => {
  it("onAnnotationsChange wird initial nicht aufgerufen", () => {
    const onChange = vi.fn();
    render(
      <AnnotationProvider onAnnotationsChange={onChange}>
        <div />
      </AnnotationProvider>
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── Interface Building mode ──────────────────────────────────────────────────

describe("App – Interface Building mode", () => {
  it("zeigt Sidebar und Canvas", () => {
    render(<App onFinish={() => {}} outputType="Interface Building" />);
    expect(screen.getByText("Components")).toBeInTheDocument();
  });

  it("onFinish enthält leere components und events", async () => {
    const onFinish = vi.fn();
    render(<App onFinish={onFinish} outputType="Interface Building" />);
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining<Partial<FinishData>>({
          components: [],
          events: [],
        })
      );
    });
  });
});