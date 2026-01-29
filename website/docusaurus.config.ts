import path from 'path'
import { Config } from '@docusaurus/types'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '.env') })
import { themes as prismThemes } from 'prism-react-renderer'

// Plugins
import libraryDownloaderPlugin from './src/plugins/blueprint-downloader-plugin/library-downloader-plugin.js'
import blueprintImagesPlugin from './src/plugins/blueprint-images-plugin/blueprint-images-plugin.js'

// Create a custom plugin for webpack configuration
// the purpose of this plugin is to allow the use of the @blueprints, @src, @library and @schemas aliases
// and to copy blueprint yaml files under docs/blueprints as static assets
function webpackConfigPlugin() {
  return {
    name: 'webpack-config-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@blueprints': path.resolve(__dirname, 'docs/blueprints'),
            '@src': path.resolve(__dirname, 'src'),
            '@library': path.resolve(__dirname, 'src/library'),
            '@schemas': path.resolve(__dirname, 'schemas'),
          },
        },
        module: {
          rules: [
            {
              test: /\.ya?ml$/,
              type: 'asset/source',
              include: [path.resolve(__dirname, 'docs/blueprints')],
            },
          ],
        },
      }
    },
  }
}

// Environment variables that should be available to the client
const clientEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  LIBRARY_MAINTAINERS: process.env.LIBRARY_MAINTAINERS || '',
  // Robust parsing: split, trim, and filter out empty values
  ALLOWED_MAINTAINERS: process.env.ALLOWED_MAINTAINERS
    ? process.env.ALLOWED_MAINTAINERS.split(',')
        .map((login) => login.trim())
        .filter(Boolean)
    : [],
}

const config: Config = {
  title: 'Awesome HA Library',
  tagline: 'A curated Library of automation blueprints for Home Assistant.',
  url: 'https://yarafie.github.io',
  baseUrl: '/awesome-ha-blueprints/',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  favicon: 'img/favicon.ico',
  organizationName: 'yarafie',
  projectName: 'awesome-ha-blueprints',

  // Removed the GTM script as we're now using react-ga4 for a more stable implementation
  // scripts: ['/awesome-ha-blueprints/js/google-tag-manager.js'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Make environment variables available to client-side code
  customFields: {
    env: clientEnv,
  },

  themeConfig: {
    announcementBar: {
      id: 'support_us',
      content:
        '🚀 <b>Love this project?</b> <a target="_blank" href="https://github.com/yarafie/awesome-ha-blueprints">Drop a star on GitHub</a>🌟 or <a target="_blank" href="https://www.buymeacoffee.com/yarafiet">make a small donation</a>☕ to show your support!',
      backgroundColor: '#fffbd4',
      textColor: '#091E42',
    },

    navbar: {
      style: 'primary',
      title: 'Awesome HA Library',
      logo: {
        alt: 'Awesome HA Library Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/introduction/',
          activeBaseRegex: '^/docs/introduction',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: 'docs/blueprints/',
          activeBaseRegex: '^/docs/blueprints',
          label: 'Blueprints',
          position: 'left',
        },
        {
          href: '/help',
          label: 'Help',
          position: 'right',
        },
        {
          href: 'https://www.buymeacoffee.com/yarafiet',
          label: 'Donate',
          position: 'right',
        },
        {
          href: 'https://github.com/yarafie/awesome-ha-blueprints/',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    /**
     * - Desktop: sidebar stays docked
     * - Mobile: sidebar is hidden by default
     * - Mobile: sidebar opens only via hamburger button
     * - Sidebar does NOT auto-open unless user navigates into docs
     */
    docs: {
      sidebar: {
        hideable: true, // Allows user to toggle sidebar
        autoCollapseCategories: true,
      },
    },

    footer: {
      links: [],
      copyright: `Awesome HA Library is maintained by
         <a href='https://github.com/EPMatt'>Matteo Agnoletto</a>.<br/>
         This fork is developed and maintained by
         <a href='https://github.com/yarafie'>yarafie</a>.<br/>
         Licensed under the
         <a href='https://github.com/yarafie/awesome-ha-blueprints/blob/main/LICENSE'>
         GPL-3.0 License
         </a>`,
      logo: {
        src: 'img/metrics.svg',
        alt: 'Blueprint Metrics',
        href: '/awesome-ha-blueprints/metrics/',
        width: 38,
        height: 38,
        style: {
          borderRadius: '6px',
          background: 'var(--ifm-color-primary)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          padding: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          /* Anchor to lower right corner of the footer with minimal bottom offset */
          position: 'absolute',
          right: '20px',
          zIndex: 100,
        },
      },
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/yarafie/awesome-ha-blueprints/edit/main/website/',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    // Default webpack config
    webpackConfigPlugin,

    //Utility Plugins
    libraryDownloaderPlugin,
    blueprintImagesPlugin,

    // Make environment variables available to the client
    function () {
      return {
        name: 'docusaurus-env-plugin',
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: 'script',
                innerHTML: `window.env = ${JSON.stringify(clientEnv)};`,
              },
            ],
          }
        },
      }
    },
  ],
}
export default config
