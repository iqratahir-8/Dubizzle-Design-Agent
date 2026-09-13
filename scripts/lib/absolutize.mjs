/**
 * The site links images, stylesheets and fonts by root-relative path (`/assets/...`,
 * `/_next/static/...`). Opened from disk those resolve to nothing, so a capture renders
 * unstyled with broken images. Pin every such reference to the live origin; protocol-
 * relative `//cdn...` would likewise become `file://cdn`.
 */
export function absolutize(html, origin) {
  return html
    .replace(/\b(href|src|poster|action)=(["'])\/\//g, '$1=$2https://')
    .replace(/\b(href|src|poster|action)=(["'])\/(?!\/)/g, `$1=$2${origin}/`)
    .replace(/\bsrcset=(["'])([^"']*)\1/g, (_, q, list) =>
      `srcset=${q}${list.replace(/(^|,\s*)\/(?!\/)/g, `$1${origin}/`)}${q}`,
    )
    .replace(/url\((["']?)\/\//g, 'url($1https://')
    .replace(/url\((["']?)\/(?!\/)/g, `url($1${origin}/`);
}
