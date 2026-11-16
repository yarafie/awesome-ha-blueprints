/**
 * test-safe-markdown.mjs
 *
 * Runs src/utils/safeMarkdown.ts against the real `marked` library with
 * a set of harmless and hostile changelog texts, and prints PASS or FAIL
 * for each.
 *
 *   cd website && node scripts/test-safe-markdown.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.join(here, '..', 'src', 'utils', 'safeMarkdown.ts')
const tempPath = path.join(here, '.safe-markdown-test.mjs')

// Turn the TypeScript helper into plain JavaScript for Node.
let code = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
code = code.replace(
  /import \{ emojiMap \} from ['"]@src\/utils\/emojiMap['"];?/,
  "const emojiMap = { ':tada:': '🎉' }",
)

const ALLOWED_TAG =
  /^<\/?(?:p|br|hr|strong|em|del|code|pre|ul|ol|li|blockquote)\s*\/?>$|^<\/a>$|^<a href="https?:\/\/[^\s"'<>`]+" target="_blank" rel="noopener noreferrer">$/i

const tagsOf = (html) => html.match(/<[^>]*>/g) || []
const onlyAllowedTags = (html) => tagsOf(html).every((t) => ALLOWED_TAG.test(t))
const has = (text) => (html) => html.includes(text)
const lacksTag = (name) => (html) =>
  !tagsOf(html).some((t) => new RegExp(`^</?${name}\\b`, 'i').test(t))

// [label, input, checks that must all be true]
const cases = [
  // ── things that must keep working ──
  ['plain text', 'Fixed a bug.', [has('Fixed a bug.')]],
  [
    'link to GitHub',
    'See [#434](https://github.com/EPMatt/awesome-ha-blueprints/issues/434)',
    [
      has(
        '<a href="https://github.com/EPMatt/awesome-ha-blueprints/issues/434" target="_blank" rel="noopener noreferrer">#434</a>',
      ),
    ],
  ],
  [
    'link with & in the address',
    '[q](https://example.com/?a=1&b=2)',
    [has('href="https://example.com/?a=1&amp;b=2"')],
  ],
  [
    'inline code',
    'Use `helper_last_controller_event` here',
    [has('<code>helper_last_controller_event</code>')],
  ],
  ['bold', 'This is **important**', [has('<strong>important</strong>')]],
  ['emoji code', 'Initial release :tada:', [has('🎉')]],
  ['line break', 'first line\nsecond line', [has('<br>')]],
  ['mention stays text', 'by (@yarafie)', [has('@yarafie')]],
  // ── things that must be neutralised ──
  [
    'script tag',
    'hi <script>alert(1)</script>',
    [lacksTag('script'), has('&lt;script&gt;')],
  ],
  ['image with onerror', '<img src=x onerror=alert(1)>', [lacksTag('img')]],
  ['inline event handler', '<b onclick="alert(1)">x</b>', [lacksTag('b')]],
  [
    'iframe',
    '<iframe src="https://evil.example"></iframe>',
    [lacksTag('iframe')],
  ],
  ['svg onload', '<svg onload=alert(1)>', [lacksTag('svg')]],
  ['style tag', '<style>body{display:none}</style>', [lacksTag('style')]],
  ['javascript: link', '[click](javascript:alert(1))', [lacksTag('a')]],
  [
    'data: link',
    '[click](data:text/html,<script>alert(1)</script>)',
    [lacksTag('a'), lacksTag('script')],
  ],
  [
    'HTML inside link text',
    '[<img src=x onerror=alert(1)>](https://github.com)',
    [lacksTag('img')],
  ],
  [
    'quote in link address',
    '[x](<https://a.example/" onclick="alert(1)>)',
    [(h) => !/<a [^>]*onclick/i.test(h)],
  ],
  [
    'title breaking out',
    '[x](https://a.example \'t" onmouseover="alert(1)\')',
    [(h) => !/<a [^>]*onmouseover/i.test(h)],
  ],
  [
    'Markdown image',
    '![tracker](https://evil.example/p.png)',
    [lacksTag('img')],
  ],
  ['autolink javascript', '<javascript:alert(1)>', [lacksTag('a')]],
]

let failed = 0
try {
  fs.writeFileSync(tempPath, code)
  const { markdownToHtml } = await import(pathToFileURL(tempPath).href)
  cases.forEach(([label, input, checks], index) => {
    let html = ''
    let ok = false
    try {
      html = markdownToHtml(input)
      ok = onlyAllowedTags(html) && checks.every((check) => check(html))
    } catch (error) {
      html = `threw: ${error.message}`
    }
    if (!ok) failed += 1
    const count = `[${String(index + 1).padStart(2)}/${cases.length}]`
    console.log(`${count} ${ok ? 'PASS' : 'FAIL'}  ${label}`)
    if (!ok) {
      console.log(`         input : ${input}`)
      console.log(`         output: ${html}`)
    }
  })
} finally {
  fs.rmSync(tempPath, { force: true })
}

console.log(
  failed === 0
    ? `\nAll ${cases.length} checks passed.`
    : `\n${failed} of ${cases.length} checks FAILED.`,
)
process.exit(failed === 0 ? 0 : 1)
