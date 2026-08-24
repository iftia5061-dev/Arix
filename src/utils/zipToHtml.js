import JSZip from 'jszip'

/**
 * Reads a .zip file (containing an index.html and optionally .css files),
 * and returns a single self-contained HTML string with all CSS inlined.
 * This lets us preview a static homepage inside an <iframe srcdoc="...">
 * without ever fetching anything from an external server (avoids
 * X-Frame-Options issues entirely, since nothing is cross-origin).
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

  // Find all CSS files in the zip
  const cssFiles = Object.values(zip.files).filter(
    (f) => !f.dir && f.name.toLowerCase().endsWith('.css')
  )

  let combinedCss = ''
  for (const cssFile of cssFiles) {
    const cssText = await cssFile.async('text')
    combinedCss += `\n/* ${cssFile.name} */\n${cssText}\n`
  }

  // Remove any <link rel="stylesheet" ...> tags (since we're inlining CSS instead)
  html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, '')

  // Inject the combined CSS into a <style> tag right before </head>
  const styleTag = `<style>${combinedCss}</style>`
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}</head>`)
  } else {
    html = styleTag + html
  }

  return html
}