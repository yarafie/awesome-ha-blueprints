/**
 * Component: PayloadPreview
 * ────────────────────────────────────────────────────────────────
 *
 * Purpose:
 *  - Display the final Phase 6 submission payload
 *  - Read-only preview for contributor validation
 *
 * Phase A:
 *  - Includes updateTarget context for blueprint:update flows
 *
 * Notes:
 *  - No submission occurs here
 *  - No backend calls
 */
import React from 'react'
import type { ParsedYaml } from '../state/contributionState'
import type { BlueprintMetadataDraft } from '../services/deriveBlueprintMetadata'
import type { UpdateTarget } from '../state/contributionState'

interface Props {
  draft: BlueprintMetadataDraft
  yaml: ParsedYaml
  updateIntent?: 'version' | 'release'
  updateTarget?: UpdateTarget | null
}

const PayloadPreview: React.FC<Props> = ({
  draft,
  yaml,
  updateIntent,
  updateTarget,
}) => {
  const payload = {
    intent: updateIntent ?? 'new',
    updateTarget: updateTarget ?? null,
    blueprint: {
      metadata: draft,
      yaml: yaml.raw,
    },
  }

  return (
    <section className='container padding-vert--lg'>
      <h2>Submission Payload Preview</h2>
      <p style={{ opacity: 0.75 }}>
        This is a preview of the data that will be submitted for review.
      </p>

      <pre
        style={{
          marginTop: 24,
          padding: 16,
          background: 'var(--ifm-code-background)',
          borderRadius: 8,
          overflowX: 'auto',
          fontSize: 13,
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </section>
  )
}

export default PayloadPreview
