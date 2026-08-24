import JSZip from 'jszip'

/**
 * Reads a .zip file (containing an index.html and optionally .css/.js files),
 * and returns a single self-contained HTML string with all CSS and JS inlined.
 * This lets us preview a static homepage inside an <iframe srcDoc="..."> without
 * ever fetching anything from an external server (avoids X-Frame-Options issues
 * entirely, since nothing is cross-origin).
 */
export async function zipToInlineHtml(file) {
  const zip = await JSZip.loadAsync(file)

  // Find index.html anywhere in the zip (handles zips with a wrapper folder)
  const htmlFile = Object.values(zip.files).find(
    (f) => !f.dir && f.name.toLowerCase().endsWith('index.html')
  )

  if (!htmlFile) {
    throw new Error('No index.html found in the zip file.')
  }

  let html = await htmlFile.async('text')

  // --- Inline all CSS files ---
  const cssFiles = Object.values(zip.files).filter(
    (f) => !f.dir && f.name.toLowerCase().endsWith('.css')
  )

  let combinedCss = ''
  for (const cssFile of cssFiles) {
    const cssText = await cssFile.async('text')
    combinedCss += `\n/* ${cssFile.name} */\n${cssText}\n`
  }

  // Remove <link rel="stylesheet" ...> tags (since we're inlining CSS instead)
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '')

  const styleTag = `<style>${combinedCss}</style>`
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}</head>`)
  } else {
    html = styleTag + html
  }

  // --- Inline all local JS files ---
  const jsFiles = Object.values(zip.files).filter(
    (f) => !f.dir && f.name.toLowerCase().endsWith('.js')
  )

  let combinedJs = ''
  for (const jsFile of jsFiles) {
    const jsText = await jsFile.async('text')
    combinedJs += `\n/* ${jsFile.name} */\n${jsText}\n`
  }

  // Remove <script src="local-file.js"></script> tags that point to local
  // files (they won't exist once bundled) — but leave external CDN scripts
  // (http/https/protocol-relative URLs) untouched.
  html = html.replace(/<script\b[^>]*\bsrc=["'](?!https?:\/\/|\/\/)[^"']*["'][^>]*><\/script>/gi, '')

  if (combinedJs.trim()) {
    const scriptTag = `<script>${combinedJs}</script>`
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${scriptTag}</body>`)
    } else {
      html += scriptTag
    }
  }

  return html
}