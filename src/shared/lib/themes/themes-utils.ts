const THEME_STORAGE_KEY = 'vita-custom-theme'

export function getStoredThemeId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(THEME_STORAGE_KEY)
}

export function setStoredThemeId(themeId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_STORAGE_KEY, themeId)
}
