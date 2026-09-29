import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App, { FinishData } from "../App";
import AnnotateWrapper from "../components/utils/AnnotateWrapper";
import AnnotationProvider from "../components/utils/AnnotationProvider";
import HeuristicSidebar from "../components/layout/heuristic-sidebar";
import { Heuristic } from "../lib/types";
import AnnotationModal from "../components/ui/AnnotationModal";
import { AnnotationContext } from "../components/utils/AnnotateContext";

const HEURISTICS: Heuristic[] = [
  { id: "h1", title: "Sichtbarkeit des Systemstatus", description: "Beschreibung 1" },
  { id: "h2", title: "Übereinstimmung mit der Welt", description: "Beschreibung 2" },
];


// The snapshot lives in a nested shadow root (see AnnotatableScreen), screen queries can't reach it
function snapshotRoot(container: HTMLElement): ShadowRoot {
  const host = Array.from(container.querySelectorAll("div")).find((d) => d.shadowRoot);
  if (!host?.shadowRoot) throw new Error("kein Snapshot-Shadow-Root gefunden");
  return host.shadowRoot;
}
function inSnapshot(container: HTMLElement, selector: string): HTMLElement {
  const el = snapshotRoot(container).querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`nicht im Snapshot: ${selector}`);
  return el;
}

// ─── Annotation mode (HTML string) ───────────────────────────────────────────

describe("App – Annotation mode (HTML-String)", () => {
  it("zeigt den Finish-Button", () => {
    render(<App onFinish={() => {}} outputType="Annotation" />);
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("rendert HTML-String korrekt als echtes HTML", () => {
    const { container } = render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        interfaceContent="<h1>Mein Interface</h1>"
      />
    );
    expect(inSnapshot(container, "h1").textContent).toBe("Mein Interface");
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

// ─── Annotation mode (React element) ─────────────────────────────────────────

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

// ─── Annotation mode with heuristics ─────────────────────────────────────────

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
    // After "Fertig" h2 is active → only its textarea is shown
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });
});

// ─── Labels (localisation) ────────────────────────────────────────────────────

describe("App – labels", () => {
  const H = [{ id: "h1", title: "Visibility", description: "d1" }];

  it("nutzt ohne labels die Standardtexte", () => {
    render(<App onFinish={() => {}} outputType="Annotation" interfaceContent="<p>x</p>" heuristic={H} />);
    expect(screen.getByText("Heuristiken")).toBeInTheDocument();
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("überschreibt Texte über labels und behält die übrigen Standardtexte", () => {
    render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        interfaceContent="<p>x</p>"
        heuristic={H}
        labels={{ heuristicsTitle: "Heuristics", heuristicDone: "Done", finish: "Complete" }}
      />,
    );
    expect(screen.getByText("Heuristics")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.queryByText("Heuristiken")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Visibility"));
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Allgemeine Notiz zu dieser Heuristik...")).toBeInTheDocument();
  });
});

// ─── Annotation dialog: heuristic dropdown ────────────────────────────────────

describe("AnnotationModal – Heuristik-Dropdown", () => {
  const H = [
    { id: "h1", title: "Visibility", description: "d1" },
    { id: "h2", title: "Consistency", description: "d2" },
  ];
  const renderModal = (active: (typeof H)[number] | undefined, setHeuristic = vi.fn(), onSave = vi.fn()) => {
    render(
      <AnnotationContext.Provider
        value={{ annotate: () => {}, annotations: {}, showText: false, setShowText: () => {}, heuristic: active, setHeuristic }}
      >
        <AnnotationModal initialText="" heuristics={H} onSave={onSave} onClose={() => {}} />
      </AnnotationContext.Provider>,
    );
    return { setHeuristic, onSave };
  };

  it("zeigt die aktive Heuristik vorausgewählt und erlaubt Speichern", () => {
    renderModal(H[0]);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("h1");
    expect(screen.getByText("Speichern")).not.toBeDisabled();
  });

  it("sperrt Speichern, solange keine Heuristik gewählt ist", () => {
    renderModal(undefined);
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("");
    expect(screen.getByText("Speichern")).toBeDisabled();
  });

  it("wechselt die Heuristik über das Dropdown", () => {
    const { setHeuristic } = renderModal(H[0]);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "h2" } });
    expect(setHeuristic).toHaveBeenCalledWith(H[1]);
  });

  it("zeigt kein Dropdown ohne Heuristiken", () => {
    render(
      <AnnotationContext.Provider
        value={{ annotate: () => {}, annotations: {}, showText: false, setShowText: () => {}, setHeuristic: () => {} }}
      >
        <AnnotationModal initialText="" onSave={() => {}} onClose={() => {}} />
      </AnnotationContext.Provider>,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("Speichern")).not.toBeDisabled();
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
// ─── Annotation mode: event delegation & multiple screens ────────────────────

describe("App – Annotation via Event-Delegation", () => {
  it("lässt das übergebene HTML unverändert (keine Wrapper-Elemente)", () => {
    const { container } = render(
      <App
        onFinish={() => {}}
        outputType="Annotation"
        interfaceContent='<nav class="flex"><button class="w-full">A</button></nav>'
      />
    );
    const btn = inSnapshot(container, "button");
    expect(btn.parentElement?.tagName).toBe("NAV");
    expect(snapshotRoot(container).querySelector(".group.inline-block")).toBeNull();
  });

  it("öffnet beim Klick auf ein Element den Annotations-Dialog und speichert unter dessen ID", async () => {
    let result: FinishData | undefined;
    const { container } = render(
      <App
        onFinish={(d) => { result = d; }}
        outputType="Annotation"
        interfaceContent="<h1>Titel</h1>"
      />
    );
    fireEvent.click(inSnapshot(container, "h1"));
    fireEvent.change(screen.getByPlaceholderText(/fällt dir/i), { target: { value: "unklar" } });
    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(result).toBeDefined());
    expect(result!.annotations!["__none__"]["h1-0"].annotationText).toBe("unklar");
  });

  it("zeigt bei mehreren Screens Tabs und präfixiert die IDs pro Screen", async () => {
    let result: FinishData | undefined;
    const { container } = render(
      <App
        onFinish={(d) => { result = d; }}
        outputType="Annotation"
        interfaceContent={["<h1>Eins</h1>", "<h1>Zwei</h1>"]}
        interfaceLabels={["Start", "Ende"]}
      />
    );
    expect(screen.getByText("1 Start")).toBeInTheDocument();
    fireEvent.click(screen.getByText("2 Ende"));
    expect(inSnapshot(container, "h1").textContent).toBe("Zwei");
    fireEvent.click(inSnapshot(container, "h1"));
    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(result).toBeDefined());
    expect(Object.keys(result!.annotations!["__none__"])).toEqual(["s2:h1-0"]);
  });
});

// ─── Severity Rating ─────────────────────────────────────────────────────────

describe("App – Severity Rating", () => {
  const SCALE = {
    title: "Schweregrad",
    options: [
      { value: 0, label: "kein Problem" },
      { value: 3, label: "großes Problem" },
    ],
  };

  it("verlangt einen Schweregrad und speichert ihn an der Annotation", async () => {
    let result: FinishData | undefined;
    const { container } = render(
      <App
        onFinish={(d) => { result = d; }}
        outputType="Annotation"
        interfaceContent="<h1>Titel</h1>"
        severityScale={SCALE}
      />
    );
    fireEvent.click(inSnapshot(container, "h1"));
    expect(screen.getByText("Speichern").closest("button")).toBeDisabled();
    fireEvent.click(screen.getByText("großes Problem"));
    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(result).toBeDefined());
    expect(result!.annotations!["__none__"]["h1-0"].severity).toBe(3);
    expect((result!.events.find((e) => e.action === "annotate") as any).severity).toBe(3);
  });

  it("ohne Skala bleibt Speichern frei und es wird kein Schweregrad gespeichert", async () => {
    let result: FinishData | undefined;
    const { container } = render(
      <App onFinish={(d) => { result = d; }} outputType="Annotation" interfaceContent="<h1>Titel</h1>" />
    );
    fireEvent.click(inSnapshot(container, "h1"));
    fireEvent.click(screen.getByText("Speichern"));
    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(result).toBeDefined());
    expect(result!.annotations!["__none__"]["h1-0"]).not.toHaveProperty("severity");
  });
});
