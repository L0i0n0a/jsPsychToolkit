import { createContext, useContext } from "react"
import { defaultLabels, type UiLabels } from "../../lib/labels"

// Falls back to the default texts so components also work without a provider
export const LabelsContext = createContext<UiLabels>(defaultLabels)

export function useLabels() {
  return useContext(LabelsContext)
}
