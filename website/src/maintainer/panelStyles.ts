import type { CSSProperties } from 'react'

export const panelBaseStyle: CSSProperties = {
  marginTop: '2rem',
  padding: '1.25rem',
  borderRadius: '12px',
  background: 'var(--ifm-background-surface-color)',
}

export const solidPanelBorder: CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
}

export const dashedPanelBorder: CSSProperties = {
  border: '1px dashed var(--ifm-color-emphasis-300)',
  opacity: 0.85,
}
