/**
 * Component: YamlUpload
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Upload and parse Home Assistant blueprint YAML
 *  - Extract metadata ONLY (no execution logic)
 *
 * Key requirement:
 *  - Must tolerate Home Assistant YAML tags like `!input`
 *
 * Phase:
 *  - Phase 2
 *  - Phase 6 requires raw + filename
 */
import React, { useState } from 'react'
import yaml from 'yaml'

export interface ParsedYaml {
  name: string | null
  domain: string | null
  description: string | null
  inputs: string[]
  raw: string | null
  fileName: string | null
}

interface Props {
  onParsed: (yaml: ParsedYaml) => void
  onError: (error: string) => void
}

function stripHomeAssistantTags(raw: string): string {
  return raw.replace(/!input\s+/g, '')
}

const YamlUpload: React.FC<Props> = ({ onParsed, onError }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<'ready' | 'parsing' | 'error'>('ready')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    try {
      setStatus('parsing')
      setErrorMsg(null)

      const raw = await file.text()
      const safe = stripHomeAssistantTags(raw)
      const doc = yaml.parse(safe) as any
      const blueprint = doc?.blueprint ?? {}

      const parsed: ParsedYaml = {
        name: typeof blueprint?.name === 'string' ? blueprint.name : null,
        domain: typeof blueprint?.domain === 'string' ? blueprint.domain : null,
        description:
          typeof blueprint?.description === 'string'
            ? blueprint.description
            : null,
        inputs:
          blueprint?.input && typeof blueprint.input === 'object'
            ? Object.keys(blueprint.input)
            : [],
        raw,
        fileName: file.name,
      }

      onParsed(parsed)
      setStatus('ready')
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to parse YAML'
      setStatus('error')
      setErrorMsg(msg)
      onError(msg)
    }
  }

  return (
    <section className='container padding-vert--lg'>
      <h2>Upload YAML</h2>
      <p>
        Upload your blueprint <strong>.yaml</strong> / <strong>.yml</strong>. We
        will extract name, domain, description, and inputs for a preview.
      </p>

      <input
        type='file'
        accept='.yaml,.yml'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setFileName(file.name)
          handleFile(file)
        }}
      />

      <div style={{ marginTop: 10, fontSize: 14 }}>
        <div>
          <strong>Selected file:</strong> {fileName ?? '—'}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          {status === 'ready'
            ? 'Ready'
            : status === 'parsing'
              ? 'Parsing…'
              : 'Error'}
        </div>
        {status === 'error' && errorMsg && (
          <div style={{ marginTop: 6, color: 'var(--ifm-color-danger)' }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
      </div>
    </section>
  )
}

export default YamlUpload
