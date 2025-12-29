import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

// Add type declaration for the Docusaurus context
interface DocusaurusContext {
  siteConfig?: {
    title?: string
    tagline?: string
  }
}

// website landing page component
export default function Home(): React.ReactElement {
  const context = useDocusaurusContext() as DocusaurusContext
  const { siteConfig = {} } = context

  return (
    <Layout
      // websit-specific page title and description
      title={`${siteConfig.title}`}
      description={`${siteConfig.tagline}`}
    >
      <header
        className={clsx('hero hero--primary', styles.heroBanner)}
        style={{ minHeight: '70vh' }}
      >
        <div className='container'>
          <img
            alt='Awesome HA Blueprints logo'
            src={useBaseUrl('img/logo.svg')}
            className='margin-bottom--lg'
            style={{ width: 80 }}
          />

          {/* website-specific hero title */}
          <h1 className='hero__title' style={{ color: 'white' }}>
            {siteConfig.title}
          </h1>

          {/* website-specific hero subtitle */}
          <p className='hero__subtitle' style={{ color: 'white' }}>
            A curated collection of blueprints for Home Assistant.
            <br />
            Reliable, customizable, fully tested by the community.
            <br />
            Forked and maintained by yarafie.
          </p>

          <div className={`row margin-top--xl ${styles.buttons}`}>
            <div className='col margin-bottom--lg'>
              <Link
                className={clsx(
                  'button button button--secondary button--lg margin-horiz--sm',
                  styles.getStarted,
                )}
                // Route users into the website documentation
                to={useBaseUrl('docs/introduction')}
              >
                Get Started
              </Link>
            </div>

            <div className='col margin-bottom--lg'>
              <Link
                className={clsx(
                  'button button button--secondary button--lg margin-horiz--sm',
                  styles.getStarted,
                )}
                // Route users to website blueprints overview
                to={useBaseUrl('docs/blueprints')}
              >
                Browse Blueprints
              </Link>
            </div>
          </div>
        </div>
      </header>
    </Layout>
  )
}
