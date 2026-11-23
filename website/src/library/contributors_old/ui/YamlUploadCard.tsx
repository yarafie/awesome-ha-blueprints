/**
 * YamlUploadCard
 * ────────────────────────────────────────────────────────────────
 *
 * Step 2.2.1
 *  - Upload a YAML file
 *  - Read contents as raw text
 *  - No parsing, no validation, no analysis
 */

import React, { useState } from 'react'

interface Props {
  value: string | null
  onChange: (yaml: string | null) => void
}

const YamlUploadCard: React.FC<Props> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File) => {
    setLoading(true)
    try {
      const text = await file.text()
      onChange(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='card'>
      <div className='card__body'>
        <h3>Upload Updated YAML</h3>

        <input
          type='file'
          accept='.yaml,.yml'
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        {loading && (
          <div style={{ marginTop: 12 }}>
            <progress style={{ width: '100%' }} />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              Reading YAML file…
            </div>
          </div>
        )}

        {!loading && value && (
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            YAML loaded ({value.split('\n').length} lines)
          </p>
        )}
      </div>
    </div>
  )
}

export default YamlUploadCard
