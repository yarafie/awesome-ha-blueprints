/**
 * UI: PayloadPreview (Phase 6 payload preview only)
 * ────────────────────────────────────────────────
 *
 * Must show EXACT payload that would be handed to Phase 6.
 * No execution. No extra UI beyond preview.
 */

import React from 'react'
import type { BlueprintMetadataDraft } from '../state/deriveBlueprintMetadata'
import type { YamlDerivedPreview } from '../state/contributionState'

export interface Phase6Payload {
  kind: 'phase6_payload_preview_v1'
  blueprint: {
    blueprint_json: {
      blueprint_id: string
      name: string
      description: string
      category: 'automations'
      status: 'active' | 'deprecated'
      librarians: { id: string; name: string; url?: string }[]
      tags?: string[]
      images?: string[]
      manual_files?: string[]
      external_references?: { label: string; url: string }[]
    }
  }
  yaml: {
    file_name: string | null
    raw: string | null
    derived_preview: {
      name: string | null
      domain: string | null
      inputs: string[]
    }
  }
  assets: {
    image_png: string | null
    manual_pdf: string | null
  }
}

function buildPhase6Payload(params: {
  draft: BlueprintMetadataDraft
  yaml: YamlDerivedPreview
}): Phase6Payload {
  const blueprint_json: Phase6Payload['blueprint']['blueprint_json'] = {
    blueprint_id: params.draft.blueprint_id,
    name: params.draft.name,
    description: params.draft.description,
    category: 'automations',
    status: params.draft.status,
    librarians: params.draft.librarians.map((l) => ({ ...l })),
  }

  if (params.draft.tags.length) blueprint_json.tags = [...params.draft.tags]
  if (params.draft.images.length)
    blueprint_json.images = [...params.draft.images]
  if (params.draft.manual_files.length)
    blueprint_json.manual_files = [...params.draft.manual_files]
  if (params.draft.external_references.length) {
    blueprint_json.external_references = params.draft.external_references.map(
      (r) => ({
        label: r.label,
        url: r.url,
      }),
    )
  }

  return {
    kind: 'phase6_payload_preview_v1',
    blueprint: { blueprint_json },
    yaml: {
      file_name: params.yaml.fileName,
      raw: params.yaml.raw,
      derived_preview: {
        name: params.yaml.name,
        domain: params.yaml.domain,
        inputs: params.yaml.inputs,
      },
    },
    assets: {
      image_png: params.draft.images.length ? params.draft.images[0] : null,
      manual_pdf: params.draft.manual_files.length
        ? params.draft.manual_files[0]
        : null,
    },
  }
}

export default function PayloadPreview(props: {
  draft: BlueprintMetadataDraft
  yaml: YamlDerivedPreview
}) {
  const payload = buildPhase6Payload({ draft: props.draft, yaml: props.yaml })

  return (
    <section className='container padding-vert--lg'>
      <h2>Phase 6 Payload Preview</h2>
      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
          maxWidth: 1000,
        }}
      >
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </section>
  )
}
