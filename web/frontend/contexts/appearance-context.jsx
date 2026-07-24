"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  APPEARANCE_DEFAULTS,
  applyAppearance,
  appearanceToCssVars,
  loadAppearance,
  normalizeAppearance,
  resetAppearance,
  saveAppearance,
} from "../utils/appearance"

const AppearanceContext = createContext({
  appearance: APPEARANCE_DEFAULTS,
  cssVars: appearanceToCssVars(APPEARANCE_DEFAULTS),
  setAppearance: () => {},
  persistAppearance: () => {},
  restoreDefaults: () => {},
})

export function AppearanceProvider({ children }) {
  // Only the saved theme — draft edits live on the Appearance page until Save.
  const [appearance, setAppearanceState] = useState(() => {
    if (typeof window === "undefined") return { ...APPEARANCE_DEFAULTS }
    return loadAppearance()
  })

  useEffect(() => {
    applyAppearance(appearance)
  }, [appearance])

  const setAppearance = useCallback((next) => {
    setAppearanceState((prev) => {
      const merged =
        typeof next === "function"
          ? normalizeAppearance(next(prev))
          : normalizeAppearance({ ...prev, ...next })
      return merged
    })
  }, [])

  const persistAppearance = useCallback((theme) => {
    const saved = saveAppearance(theme)
    setAppearanceState(saved)
    return saved
  }, [])

  const restoreDefaults = useCallback(() => {
    const defaults = resetAppearance()
    setAppearanceState(defaults)
    return defaults
  }, [])

  const cssVars = useMemo(() => appearanceToCssVars(appearance), [appearance])

  const value = useMemo(
    () => ({
      appearance,
      cssVars,
      setAppearance,
      persistAppearance,
      restoreDefaults,
    }),
    [appearance, cssVars, setAppearance, persistAppearance, restoreDefaults],
  )

  return (
    <AppearanceContext.Provider value={value}>
      <div className="se-app" style={cssVars}>
        {children}
      </div>
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  return useContext(AppearanceContext)
}
