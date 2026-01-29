/**
 * ReleaseMetadataPanel
 *
 * Schema-backed read-only renderer for release.json.
 * Uses the canonical release.schema.json.
 *
 * This panel represents a single maintainer-defined release
 * grouping versions under a library.
 */

import React from 'react'
import SchemaRenderer from './SchemaRenderer'
import releaseSchema from '@site/schemas/release.schema.json'

interface ReleaseMetadataPanelProps {
  data: unknown
}

export default function ReleaseMetadataPanel({
  data,
}: ReleaseMetadataPanelProps): JSX.Element {
  return (
    <SchemaRenderer
      title='Release Metadata'
      schema={releaseSchema as unknown as any}
      data={data}
    />
  )
}
