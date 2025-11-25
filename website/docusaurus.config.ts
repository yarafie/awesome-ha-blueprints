import { Config } from '@docusaurus/types'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import { themes as prismThemes } from 'prism-react-renderer'
import blueprintDownloaderPlugin from './src/plugins/blueprint-downloader-plugin/blueprint-downloader-plugin.js'

function webpackConfigPlugin() {
  return {
    name: 'webpack-config-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@blueprints': path.resolve(__dirname, '../blueprints'),
          },
        },
        module: {
          rules: [
            {
              test: /\.ya?ml$/,
              type: 'asset/source',
              include: [path.resolve(__dirname, '../blueprints')],
            },
          ],
        },
      }
    },
  }
}

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

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    env: clientEnv,
  },

  themeConfig: {
    navbar: {
      style: 'primary',
      title: 'Awesome HA Blueprints',
      logo: {
        alt: 'Logo',
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
