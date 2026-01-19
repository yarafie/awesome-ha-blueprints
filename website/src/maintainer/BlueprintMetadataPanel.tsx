/**
 * BlueprintMetadataPanel
 *
 * Schema-backed read-only renderer for blueprint.json.
 * Uses the canonical blueprint.schema.json.
 */

import React from 'react'
import SchemaRenderer from './SchemaRenderer'

// Docusaurus provides the @site alias to the website root.
// This keeps the import stable regardless of where this component lives.
import blueprintSchema from '@site/schemas/blueprint.schema.json'

interface BlueprintMetadataPanelProps {
  data: unknown
}

export default function BlueprintMetadataPanel({
  data,
}: BlueprintMetadataPanelProps): JSX.Element {
  return (
    <SchemaRenderer
      title='Blueprint Metadata'
      schema={blueprintSchema as unknown as any}
      data={data}
    />
  )
}
