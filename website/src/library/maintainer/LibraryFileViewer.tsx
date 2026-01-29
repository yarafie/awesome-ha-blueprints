/**
 * LibraryFileViewer
 *
 * Orchestrates read-only, schema-backed views of a fully-selected
 * library path in strict top-down order:
 *
 * 1. blueprint.json
 * 2. library.json
 * 3. release.json
 * 4. changelog.json (if present)
 * 5. version.json
 * 6. version MDX (if present)
 * 7. blueprint YAML
 *
 * This component assumes a fully-resolved physical selection.
 * Rendering is gated upstream — no defensive path handling here.
 */

import React from 'react'
import {
  jsonContext,
  changelogsContext,
  blueprintsContext,
  docsContext,
} from '@src/utils/libraryContexts'
import { panelBaseStyle, solidPanelBorder } from './panelStyles'

// Metadata panels
import BlueprintMetadataPanel from './BlueprintMetadataPanel'
import LibraryMetadataPanel from './LibraryMetadataPanel'
import ReleaseMetadataPanel from './ReleaseMetadataPanel'
import ChangelogPanel from './ChangelogPanel'
import VersionMetadataPanel from './VersionMetadataPanel'

interface LibraryFileViewerProps {
  category: string
  blueprint: string
  library: string
  release: string
  version: string
}

export default function LibraryFileViewer({
  category,
  blueprint,
  library,
  release,
  version,
}: LibraryFileViewerProps): JSX.Element {
  const blueprintJson = jsonContext(`./${category}/${blueprint}/blueprint.json`)

  const libraryJson = jsonContext(
    `./${category}/${blueprint}/${library}/library.json`,
  )

  const releaseBasePath = `./${category}/${blueprint}/${library}/${release}`

  const releaseJson = jsonContext(`${releaseBasePath}/release.json`)

  const changelogPath = `${releaseBasePath}/changelog.json`
  const hasChangelog = changelogsContext.keys().includes(changelogPath)

  const versionBasePath = `${releaseBasePath}/${version}`

  const versionJson = jsonContext(`${versionBasePath}/version.json`)

  const mdxPath = `${versionBasePath}/${version}.mdx`
  const hasMdx = docsContext.keys().includes(mdxPath)

  const yamlPath = `${versionBasePath}/${blueprint}.yaml`
  const yamlText = blueprintsContext(yamlPath)

  return (
    <section
      style={{
        ...panelBaseStyle,
        ...solidPanelBorder,
        marginTop: '2rem',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Library Contents</h3>

      {/* 1. Blueprint */}
      <BlueprintMetadataPanel data={blueprintJson} />

      {/* 2. Library */}
      <LibraryMetadataPanel data={libraryJson} />

      {/* 3. Release */}
      <ReleaseMetadataPanel data={releaseJson} />

      {/* 4. Changelog (optional) */}
      {hasChangelog && (
        <ChangelogPanel data={changelogsContext(changelogPath)} />
      )}

      {/* 5. Version */}
      <VersionMetadataPanel data={versionJson} />

      {/* 6. Version Documentation (optional) */}
      {hasMdx && (
        <section
          style={{
            marginTop: '1rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '12px',
            padding: '1.25rem',
            background: 'var(--ifm-background-surface-color)',
          }}
        >
          <h4 style={{ marginTop: 0 }}>Version Documentation</h4>
          {React.createElement(docsContext(mdxPath).default)}
        </section>
      )}

      {/* 7. Blueprint YAML */}
      <section
        style={{
          marginTop: '1rem',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '12px',
          padding: '1.25rem',
          background: 'var(--ifm-background-surface-color)',
        }}
      >
        <h4 style={{ marginTop: 0 }}>Blueprint YAML</h4>
        <pre
          style={{
            margin: 0,
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'var(--ifm-background-color)',
            overflowX: 'auto',
          }}
        >
          {yamlText}
        </pre>
      </section>
    </section>
  )
}
