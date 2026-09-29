import { createContext, useContext } from "react"
import { defaultLabels, type UiLabels } from "../../lib/labels"

// Defaults to the built-in texts, so components also work without a provider.
export const LabelsContext = createContext<UiLabels>(defaultLabels)

export function useLabels() {
  return useContext(LabelsContext)
}
