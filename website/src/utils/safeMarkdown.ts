/**
 * safeMarkdown
 * ────────────────────────────────────────────────────────────────
 * The one place where user-written Markdown (changelog descriptions)
 * is turned into HTML.
 *
 * Changelog text can come from contributors, so it is treated as
 * untrusted:
 *   - raw HTML in the text is shown as text, never interpreted
 *   - links are only created for http:// and https:// addresses
 *   - images are not rendered
 *   - as a last step, every tag in the result is checked against a
 *     short allow-list and anything else is shown as text
 *
 * Still supported, exactly as before: links, `inline code`, **bold**,
 * _italic_, line breaks, lists and :emoji_codes:.
 */
import { Marked, Renderer, type Tokens } from 'marked'
import { emojiMap } from '@src/utils/emojiMap'

export const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const isSafeUrl = (href: string): boolean =>
  /^https?:\/\/[^\s"'<>`]+$/i.test(href)

// ─────────────────────────────────────────────
// Renderer: neutralise everything that could carry code
// ─────────────────────────────────────────────
const renderer = new Renderer()

// Raw HTML written in the Markdown source: show it, do not run it.
renderer.html = function (token: Tokens.HTML | Tokens.Tag): string {
  return escapeHtml(token.raw ?? token.text ?? '')
}

// Links: http(s) only, opened in a new tab. The link text is rendered
// through this same renderer, so HTML inside it is neutralised too.
renderer.link = function (token: Tokens.Link): string {
  const inner = token.tokens
    ? this.parser.parseInline(token.tokens)
    : escapeHtml(token.text ?? '')
  const href = String(token.href ?? '').replace(/&amp;/g, '&')
  if (!isSafeUrl(href)) return inner
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
}

// Images are not rendered: show the original Markdown as text.
renderer.image = function (token: Tokens.Image): string {
  return escapeHtml(token.raw ?? token.text ?? '')
}

const md = new Marked()
md.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  async: false, // synchronous parse()
  renderer,
})

// ─────────────────────────────────────────────
// Last line of defence: allow-list of tags in the final HTML
// ─────────────────────────────────────────────
const SAFE_TAG =
  /^<\/?(?:p|br|hr|strong|em|del|code|pre|ul|ol|li|blockquote|h[1-6]|table|thead|tbody|tr|th|td)\s*\/?>$/i
const SAFE_CODE_CLASS = /^<code class="language-[\w-]+">$/
const SAFE_LINK =
  /^<a href="https?:\/\/[^\s"'<>`]+" target="_blank" rel="noopener noreferrer">$/i

const keepOnlySafeTags = (html: string): string =>
  html.replace(/<[^>]*>/g, (tag) =>
    tag === '</a>' ||
    SAFE_TAG.test(tag) ||
    SAFE_CODE_CLASS.test(tag) ||
    SAFE_LINK.test(tag)
      ? tag
      : escapeHtml(tag),
  )

// ─────────────────────────────────────────────
// Emoji replacement — uses imported emojiMap
// ─────────────────────────────────────────────
const replaceEmojiCodes = (text: string): string =>
  text.replace(/:([a-zA-Z0-9_+-]+):/g, (match) => emojiMap[match] || match)

// ─────────────────────────────────────────────
// Markdown → safe HTML (inline)
// ─────────────────────────────────────────────
export const markdownToHtml = (markdown: string): string => {
  let html = md.parse(replaceEmojiCodes(String(markdown ?? ''))) as string
  html = keepOnlySafeTags(html)
  html = html.replace(/^<p>/, '').replace(/<\/p>\s*$/, '')
  return html.trim()
}
