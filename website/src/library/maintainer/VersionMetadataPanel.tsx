/**
 * VersionMetadataPanel
 *
 * Schema-backed read-only renderer for version.json.
 * Uses the canonical version.schema.json.
 *
 * This panel represents a single physical version
 * (YYYY.MM.DD) under a release.
 */

import React from 'react'
import SchemaRenderer from './SchemaRenderer'
import versionSchema from '@site/schemas/version.schema.json'

interface VersionMetadataPanelProps {
  data: unknown
}

export default function VersionMetadataPanel({
  data,
}: VersionMetadataPanelProps): JSX.Element {
  return (
    <SchemaRenderer
      title='Version Metadata'
      schema={versionSchema as unknown as any}
      data={data}
    />
  )
}
