import React from 'react'
import Layout from '@theme/Layout'
import MDXComponent from '@theme/MDXContent'

export default function BlueprintPage({ metadata, mdx }) {
  const { title, description } = metadata

  return (
    <Layout title={title} description={description || 'Blueprint details'}>
      <div className='container margin-vert--lg'>
        <h1>{title}</h1>

        {description && <p className='margin-bottom--lg'>{description}</p>}

        {/* MDX content from blueprint.mdx */}
        <div className='markdown'>
          <MDXComponent>{mdx}</MDXComponent>
        </div>
      </div>
    </Layout>
  )
}
