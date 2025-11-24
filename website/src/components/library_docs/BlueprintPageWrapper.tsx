import React from 'react'
import Layout from '@theme/Layout'
import MDXContent from '@theme/MDXContent'

type BlueprintMetadata = {
  title?: string
  description?: string
}

type Props = {
  /** Injected by Docusaurus via addRoute({ modules: { metadata: ... } }) */
  metadata: BlueprintMetadata
  /** Injected via addRoute({ modules: { Content: ... } }) */
  Content: React.ComponentType
}

const BlueprintPageWrapper: React.FC<Props> = ({ metadata, Content }) => {
  const title = metadata?.title ?? 'Blueprint'
  const description = metadata?.description ?? ''

  return (
    <Layout title={title} description={description}>
      <div className='container margin-vert--lg'>
        <h1>{title}</h1>
        <MDXContent>
          <Content />
        </MDXContent>
      </div>
    </Layout>
  )
}

export default BlueprintPageWrapper
