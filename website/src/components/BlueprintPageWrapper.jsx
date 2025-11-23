import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'
import PropTypes from 'prop-types'

export default function BlueprintPageWrapper({ modules }) {
  const [metadata, setMetadata] = useState(null)
  const [MDX, setMDX] = useState(null)

  useEffect(() => {
    async function load() {
      if (!modules) return

      if (modules.metadata) {
        const meta = await import(/* @vite-ignore */ modules.metadata)
        setMetadata(meta.default ?? meta)
      }

      if (modules.mdx) {
        const mdxModule = await import(/* @vite-ignore */ modules.mdx)
        setMDX(mdxModule.default)
      }
    }
    load()
  }, [modules])

  if (!metadata || !MDX) {
    return (
      <Layout title='Loading…'>
        <div className='container margin-vert--lg'>
          <p>Loading blueprint…</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={metadata.title} description={metadata.description}>
      <div className='container margin-vert--lg'>
        <h1>{metadata.title}</h1>
        <MDXContent>
          <MDX />
        </MDXContent>
      </div>
    </Layout>
  )
}

BlueprintPageWrapper.propTypes = {
  modules: PropTypes.shape({
    metadata: PropTypes.string,
    mdx: PropTypes.string,
  }),
}
