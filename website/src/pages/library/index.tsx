import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from '../styles.module.css'

// Add type declaration for the Docusaurus context
interface DocusaurusContext {
  siteConfig?: {
    title?: string
    tagline?: string
  }
}

// Library landing page component
export default function LibraryHome(): React.ReactElement {
  const context = useDocusaurusContext() as DocusaurusContext
  const { siteConfig = {} } = context

  return (
    <Layout
      // Library-specific page title and description
      title={`${siteConfig.title} Awesome HA Blueprints Library`}
      description='Homepage for the Awesome HA Blueprints Library.'
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

          {/* Library-specific hero title */}
          <h1 className='hero__title' style={{ color: 'white' }}>
            Awesome HA Blueprints Library
          </h1>

          {/* Library-specific hero subtitle */}
          <p className='hero__subtitle' style={{ color: 'white' }}>
            A curated Library to hold collections of blueprints for Home
            Assistant.
            <br />
            Reliable, customizable, contributed by HA Experts, and aims to be
            tested by the community.
            <br />
            This is a Fork developed and maintained by yarafie all credits go to
            EPMatt for the original version.
          </p>

          <div className={`row margin-top--xl ${styles.buttons}`}>
            <div className='col margin-bottom--lg'>
              <Link
                className={clsx(
                  'button button button--secondary button--lg margin-horiz--sm',
                  styles.getStarted,
                )}
                // Route users into the Library documentation
                to={useBaseUrl('library/introduction')}
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
                // Route users to Library blueprints overview
                to={useBaseUrl('library/blueprints')}
              >
                Browse Library Blueprints
              </Link>
            </div>
          </div>
        </div>
      </header>
    </Layout>
  )
}
