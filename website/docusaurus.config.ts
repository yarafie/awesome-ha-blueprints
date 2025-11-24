import { Config } from '@docusaurus/types'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '.env') })
import { themes as prismThemes } from 'prism-react-renderer'
import blueprintDownloaderPlugin from './src/plugins/blueprint-downloader-plugin/blueprint-downloader-plugin.js'
import libraryAutoImportPlugin from './src/plugins/library-autoimport-plugin/library-autoimport-plugin.js'
function webpackConfigPlugin() {
  return {
    name: 'webpack-config-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@blueprints': path.resolve(__dirname, '../blueprints'),
            '@library': path.resolve(__dirname, '../library'),
          },
        },
        module: {
          rules: [
            {
              test: /\.ya?ml$/,
              type: 'asset/source',
              include: [
                path.resolve(__dirname, '../blueprints'),
                path.resolve(__dirname, '../library'),
              ],
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
    announcementBar: {
      id: 'support_us',
      content:
        '🚀 <b>Love this project?</b> <a target="_blank" href="https://github.com/EPMatt/awesome-ha-blueprints">Drop a star on GitHub</a>🌟 or <a target="_blank" href="https://www.buymeacoffee.com/yarafiet">make a small donation</a>☕  to show your support!',
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
        //        {
        //          to: 'library',
        //          activeBaseRegex: '^/library',
        //          label: 'Library',
        //          position: 'left',
        //        },
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
      copyright: `
        Awesome HA Blueprints is maintained by
        <a href='https://github.com/EPMatt'>Matteo Agnoletto</a>.<br/>
        This Fork is maintained by <a href='https://github.com/yarafie'>yarafie</a>.<br/>
        Licensed under the <a href='https://github.com/yarafie/awesome-ha-blueprints/blob/main/LICENSE'>GPL-3.0 License</a>
      `,
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
    libraryAutoImportPlugin,
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
