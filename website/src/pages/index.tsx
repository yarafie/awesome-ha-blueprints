import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

interface DocusaurusContext {
  siteConfig?: {
    title?: string
    tagline?: string
  }
}

function HomeHeader() {
  const { siteConfig } = useDocusaurusContext() as DocusaurusContext
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <h1 className='hero__title'>{siteConfig?.title}</h1>
        <p className='hero__subtitle'>{siteConfig?.tagline}</p>

        <div className='row margin-top--lg'>
          <div className='col col--12 text--center'>
            <Link
              className={clsx(
                'button button button--secondary button--lg margin-horiz--sm',
                styles.getStarted,
              )}
              to={useBaseUrl('library')}
            >
              Browse Blueprints
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  const context = useDocusaurusContext()
  const { siteConfig } = context as DocusaurusContext

  return (
    <Layout
      title={siteConfig?.title}
      description='A curated list of Home Assistant blueprints'
    >
      <HomeHeader />
    </Layout>
  )
}
