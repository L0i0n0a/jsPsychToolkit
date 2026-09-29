import { Heuristic } from "../../lib/types";
import { Textarea } from "../ui/textarea";
import { useAnnotation } from "../utils/AnnotateContext";
import { Button } from "../ui/button";
import { useState } from "react";
import { useLabels } from "../utils/LabelsContext";

function HeuristicItem({
  id,
  title,
  description,
  isActive,
  onClick,
  onFinish,
}: {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  onFinish: (id: string, text: string) => void;
}) {
  const labels = useLabels();
  const [textareaText, setTextAreaText] = useState("");
  return (
    <div
      className={`p-4 m-2 ${isActive ? "border-primary bg-primary/5" : ""} border rounded-md cursor-pointer`}
      onClick={onClick}
    >
      <p className="font-medium">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
      {isActive && (
        <div onClick={(e) => e.stopPropagation()}>
          <Textarea
            className="mt-2"
            placeholder={labels.heuristicNotePlaceholder}
            onChange={(e) => setTextAreaText(e.target.value)}
          />
          <Button
            className="mt-2"
            onClick={() => onFinish(id, textareaText)}
          >
            {labels.heuristicDone}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HeuristicSidebar({
  heuristic,
  onFinish,
}: {
  heuristic: Heuristic[];
  onFinish: (id: string, text: string) => void;
}) {
  const { heuristic: activeHeuristic, setHeuristic } = useAnnotation();
  const labels = useLabels();
  const currentIndex = heuristic.findIndex((h) => h.id === activeHeuristic?.id);
  const next = heuristic[currentIndex + 1] ?? null;

  function handleFinish(id: string, text: string) {
    onFinish(id, text);
    setHeuristic(next);
  }

  return (
    <div className="flex w-full shrink-0 flex-col overflow-y-auto rounded-md border p-2 md:h-full md:w-80">
      <h2 className="text-lg font-semibold p-2">{labels.heuristicsTitle}</h2>
      <div>
        {heuristic.map((item) => (
          <HeuristicItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            isActive={activeHeuristic?.id === item.id}
            onClick={() => setHeuristic(item)}
            onFinish={handleFinish}
          />
        ))}
      </div>
    </div>
  );
}