import path from 'path'
import { Config } from '@docusaurus/types'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '.env') })
import { themes as prismThemes } from 'prism-react-renderer'

// Plugins
import blueprintDownloaderPlugin from './src/plugins/blueprint-downloader-plugin/blueprint-downloader-plugin.js'
import controllerImagesPlugin from './src/plugins/controller-images-plugin/controller-images-plugin.js'

// Create a custom plugin for webpack configuration
// the purpose of this plugin is to allow the use of the @blueprints alias
// and to copy blueprint files as static assets
function webpackConfigPlugin() {
  return {
    name: 'webpack-config-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@blueprints': path.resolve(__dirname, 'docs/blueprints'),
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
}

const config: Config = {
  title: 'Awesome HA Blueprints',
  tagline: 'A curated list of automation blueprints for Home Assistant.',
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
      title: 'Awesome HA Blueprints',
      logo: {
        alt: 'Awesome HA Blueprints Logo',
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

    footer: {
      links: [],
      copyright: `Awesome HA Blueprints is maintained by
         <a href='https://github.com/EPMatt'>Matteo Agnoletto</a>.<br/>
         This fork is maintained by
         <a href='https://github.com/yarafie'>yarafie</a>.<br/>
         Licensed under the
         <a href='https://github.com/EPMatt/awesome-ha-blueprints/blob/main/LICENSE'>
         GPL-3.0 License
         </a>`,
      logo: {
        src: 'img/metrics.svg',
        alt: 'Blueprint Metrics',
        href: '/awesome-ha-blueprints/download_metrics/',
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
          // bottom: '5px', // <-- Reduced bottom offset
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
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  plugins: [
    webpackConfigPlugin,
    blueprintDownloaderPlugin,
    controllerImagesPlugin,

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
