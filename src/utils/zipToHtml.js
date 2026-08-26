import JSZip from 'jszip'

/**
 * Reads a .zip file (containing an HTML file and optionally .css/.js files),
 * and returns a single self-contained HTML string with all CSS and JS inlined.
 * This lets us preview a static homepage inside an <iframe srcDoc="..."> without
 * ever fetching anything from an external server (avoids X-Frame-Options issues
 * entirely, since nothing is cross-origin).
 */
export async function zipToInlineHtml(file) {
  const zip = await JSZip.loadAsync(file)
  const allFiles = Object.values(zip.files).filter((f) => !f.dir)

  // Prefer an exact "index.html" (case-insensitive, any folder depth).
  let htmlFile = allFiles.find((f) => {
    const lowerName = f.name.toLowerCase()
    return lowerName === 'index.html' || lowerName.endsWith('/index.html')
  })

  // Fallback: ANY .html file in the zip — some export tools name it
  // differently (e.g. "home.html", "main.html"). Pick the shortest path,
  // since that's most likely the root-level file.
  if (!htmlFile) {
    const anyHtml = allFiles
      .filter((f) => f.name.toLowerCase().endsWith('.html'))
      .sort((a, b) => a.name.length - b.name.length)
    htmlFile = anyHtml[0]
  }

  if (!htmlFile) {
    const fileList = allFiles.map((f) => f.name).join(', ') || '(zip appears empty)'
    throw new Error(`No .html file found in the zip. Files found: ${fileList}`)
  }

  let html = await htmlFile.async('text')

  // --- Inline all CSS files ---
  const cssFiles = allFiles.filter((f) => f.name.toLowerCase().endsWith('.css'))
  let combinedCss = ''
  for (const cssFile of cssFiles) {
    const cssText = await cssFile.async('text')
    combinedCss += `\n/* ${cssFile.name} */\n${cssText}\n`
  }

  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '')

  const styleTag = `<style>${combinedCss}</style>`
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}</head>`)
  } else {
    html = styleTag + html
  }

  // --- Inline all local JS files ---
  const jsFiles = allFiles.filter((f) => f.name.toLowerCase().endsWith('.js'))
  let combinedJs = ''
  for (const jsFile of jsFiles) {
    const jsText = await jsFile.async('text')
    combinedJs += `\n/* ${jsFile.name} */\n${jsText}\n`
  }

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