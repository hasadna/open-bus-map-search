import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const sitemap = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const app = readFileSync(join(__dirname, '/src/routes/index.tsx'), 'utf8')

  const routes = app.match(/'\/[a-z_-]*'/g)
  const urls = routes.map((route) => route.slice(1, -1))

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
            <url>
            <loc>https://open-bus-map-search.hasadna.org.il${url}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
            <lastmod>${new Date().toISOString()}</lastmod>
            </url> 
            `,
    )
    .join('\n')}
          </urlset>`
  writeFileSync(join(__dirname, '/public/sitemap.xml'), sitemap)
}

sitemap()

// credit https://blog.redsols.us/blog/how-to-create-a-dynamic-sitemap-in-react/
