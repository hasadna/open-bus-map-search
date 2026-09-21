import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CSP_DIRECTIVES, cspHeader, DEV_ONLY_DIRECTIVES } from './csp'

/** The CSP nginx serves for one `location` block, verified to be that block's only one. */
const nginxCsp = (locationPath: string) => {
  const conf = readFileSync(join(__dirname, 'nginx-default.conf'), 'utf8')
  const start = conf.search(new RegExp(String.raw`^\s*location\s+${locationPath}\s*\{`, 'm'))
  expect(start).toBeGreaterThan(-1)

  let depth = 0
  let end = conf.indexOf('{', start)
  for (let i = end; i < conf.length; i++) {
    if (conf[i] === '{') depth++
    else if (conf[i] === '}' && --depth === 0) {
      end = i
      break
    }
  }

  const declarations = [
    ...conf
      .slice(start, end)
      .matchAll(/add_header\s+Content-Security-Policy\s+"([^"]+)"\s*(always)?\s*;/g),
  ]
  expect(declarations).toHaveLength(1)
  // without `always` nginx drops the header on 4xx/5xx, shipping error pages unprotected
  expect(declarations[0][2]).toBe('always')
  return declarations[0][1]
}

it('serves in preview byte-identically what nginx serves in production', () => {
  expect(cspHeader()).toBe(nginxCsp('/'))
})

it('only ever relaxes the production policy in dev, never narrows it', () => {
  const devHeader = cspHeader(DEV_ONLY_DIRECTIVES)
  for (const [directive, sources] of Object.entries(CSP_DIRECTIVES)) {
    const devSources = devHeader.match(new RegExp(`${directive} ([^;]+)`))?.[1].split(' ')
    expect(devSources).toEqual(expect.arrayContaining(sources))
  }
})
