/**
 * Component: YamlDescriptionPreview
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Render YAML-derived description exactly as authored
 *  - Preserve formatting, spacing, lists, links
 *
 * Rules:
 *  - Markdown-only rendering
 *  - No HTML injection
 *  - SSG / SSR safe
 *
 * Phase:
 *  - Phase 2 (YAML Upload & Preview)
 */
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  description: string
}

const YamlDescriptionPreview: React.FC<Props> = ({ description }) => {
  if (!description) return null

  return (
    <section className='container padding-vert--md'>
      <h3>Description</h3>

      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
          background: 'var(--ifm-background-color)',
          maxWidth: 900,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p style={{ marginBottom: 12, lineHeight: 1.6 }}>{children}</p>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: 6 }}>{children}</li>
            ),
          }}
        >
          {description}
        </ReactMarkdown>
      </div>
    </section>
  )
}

export default YamlDescriptionPreview
