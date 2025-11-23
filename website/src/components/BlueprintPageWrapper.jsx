import React, { useEffect, useState } from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

export default function BlueprintPageWrapper({ modules: { metadata, mdx } }) {
  const [data, setData] = useState(null)
  const [MDX, setMDX] = useState(null)

  useEffect(() => {
    import(metadata).then((mod) => {
      setData(mod.default || mod)
    })
    import(mdx).then((mod) => {
      setMDX(() => mod.default)
    })
  }, [metadata, mdx])

  if (!data || !MDX) return null

  return (
    <Layout title={data.title} description={data.description}>
      <div className='container margin-vert--lg'>
        <h1>{data.title}</h1>
        <MDXContent>
          <MDX />
        </MDXContent>
      </div>
    </Layout>
  )
}

import PropTypes from 'prop-types'

BlueprintPageWrapper.propTypes = {
  modules: PropTypes.shape({
    metadata: PropTypes.string.isRequired,
    mdx: PropTypes.string.isRequired,
  }).isRequired,
}
