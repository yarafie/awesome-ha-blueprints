/**
 * LibraryMetadataPanel
 *
 * Schema-backed read-only renderer for library.json.
 * Uses the canonical library.schema.json.
 *
 * This panel represents the maintainer-owned library namespace
 * under a blueprint.
 */

import React from 'react'
import SchemaRenderer from './SchemaRenderer'
import librarySchema from '@site/schemas/library.schema.json'

interface LibraryMetadataPanelProps {
  data: unknown
}

export default function LibraryMetadataPanel({
  data,
}: LibraryMetadataPanelProps): JSX.Element {
  return (
    <SchemaRenderer
      title='Library Metadata'
      schema={librarySchema as unknown as any}
      data={data}
    />
  )
}
