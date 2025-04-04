import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const sitemap = () => {
  const app = readFileSync(join(import.meta.dirname, '/src/routes/index.tsx'), 'utf8')
  const routes = app.match(/'\/[a-z_-]*'/g)
  const urls = routes.map((route) => {
    const url = route.slice(1, -1)
    return url
  })

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
  writeFileSync(join(import.meta.dirname, '/public/sitemap.xml'), sitemap)
}

sitemap()

// credit https://blog.redsols.us/blog/how-to-create-a-dynamic-sitemap-in-react/
