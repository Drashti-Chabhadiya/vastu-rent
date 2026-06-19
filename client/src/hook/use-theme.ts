import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      return stored === 'light' || stored === 'dark' || stored === 'auto'
        ? stored
        : 'auto'
    }
    return 'auto'
  })

  // Sync theme changes across all useTheme instances in real-time
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleThemeChange = () => {
      const stored = localStorage.getItem('theme')
      const nextTheme =
        stored === 'light' || stored === 'dark' || stored === 'auto'
          ? stored
          : 'auto'
      setThemeState(nextTheme)
    }

    window.addEventListener('theme-change', handleThemeChange)
    window.addEventListener('storage', handleThemeChange)

    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
      window.removeEventListener('storage', handleThemeChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const prefersDark = mediaQuery.matches
      const resolved =
        theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme

      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
      root.style.colorScheme = resolved

      if (theme === 'auto') {
        root.removeAttribute('data-theme')
      } else {
        root.setAttribute('data-theme', theme)
      }
    }

    applyTheme()

    // Setup listener for system theme updates
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme)
    setThemeState(newTheme)
    window.dispatchEvent(new Event('theme-change'))
  }

  return { theme, setTheme }
}
