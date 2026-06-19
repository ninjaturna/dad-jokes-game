import { useState } from 'react'
import { getTheme, toggleTheme, type Theme } from '../lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getTheme())
  return { theme, toggle: () => setTheme(toggleTheme()) }
}
