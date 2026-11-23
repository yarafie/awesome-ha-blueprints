export interface FormatFinding {
  rule: string
  msg: string
}

export interface ControllerInfo {
  name?: string
  model_name?: string
  summary?: string
  integrations?: string[]
  manufacturers?: string[]
  events?: { event: string; label: string }[]
  features?: {
    text_helper: boolean
    virtual_double_press: boolean
    long_press_loop: boolean
  }
  reference_links?: string[]
}

export interface ControllerLocation {
  id: string
  library: string
  release: string
  version: string
}

export interface FormatResult {
  status: 'checked' | 'legacy' | 'free-form'
  errors: FormatFinding[]
  warnings: FormatFinding[]
  info: ControllerInfo
}

export const SITE: string
export const REPO_URL: string

export function checkControllerYaml(
  text: string,
  options?: { location?: ControllerLocation | null; includeLegacy?: boolean },
): FormatResult
