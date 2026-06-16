import fs from 'fs'
import path from 'path'
import ar from './ar.json'
import en from './en.json'
import he from './he.json'
import ru from './ru.json'

// he is the reference locale (the app's fallbackLng and the source of the i18next types)
const REFERENCE = 'he'
const locales: Record<string, object> = { en, he, ru, ar }
const languages = Object.keys(locales)

// Depth-first flattening preserves each file's key order, since JSON imports
// keep insertion order for non-numeric keys.
const flatten = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]: [string, unknown]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )

const flatKeys = Object.fromEntries(languages.map((lang) => [lang, flatten(locales[lang])]))

// --- code-frame reporting -------------------------------------------------
// Locale files are Prettier-formatted (lint-enforced), i.e. one key per line,
// so the Nth `"key":` line in the file corresponds to the Nth object key in a
// depth-first walk. That gives every dot-path an exact line number.

const dfsObjectKeys = (value: unknown, prefix: string, out: string[]): void => {
  if (Array.isArray(value)) {
    value.forEach((item, i) => dfsObjectKeys(item, `${prefix}${i}.`, out))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      out.push(`${prefix}${key}`)
      dfsObjectKeys(child, `${prefix}${key}.`, out)
    }
  }
}

const sources = Object.fromEntries(
  languages.map((lang) => {
    const lines = fs.readFileSync(path.join(__dirname, `${lang}.json`), 'utf8').split('\n')
    const keyLineNumbers = lines.flatMap((line, i) =>
      /^\s*"(?:[^"\\]|\\.)*":/.test(line) ? [i + 1] : [],
    )
    const dfsKeys: string[] = []
    dfsObjectKeys(locales[lang], '', dfsKeys)
    const lineByPath = new Map(dfsKeys.map((key, i) => [key, keyLineNumbers[i]]))
    return [lang, { lines, lineByPath }]
  }),
)

const lineOf = (lang: string, keyPath: string): number | undefined => {
  // array-element paths (key.0) have no own key line — fall back to the parent
  for (let p = keyPath; p; p = p.slice(0, Math.max(0, p.lastIndexOf('.')))) {
    const line = sources[lang].lineByPath.get(p)
    if (line) return line
  }
  return undefined
}

const codeFrame = (lang: string, keyPath: string, note: string, context = 2): string => {
  const lineNumber = lineOf(lang, keyPath)
  if (!lineNumber) return `src/locale/${lang}.json — "${keyPath}": ${note}`
  const { lines } = sources[lang]
  const first = Math.max(1, lineNumber - context)
  const last = Math.min(lines.length, lineNumber + context)
  const width = String(last).length
  const frame = [`src/locale/${lang}.json:${lineNumber}`]
  for (let n = first; n <= last; n++) {
    let text = lines[n - 1]
    if (text.length > 100) text = text.slice(0, 97) + '…'
    frame.push(`${n === lineNumber ? '>' : ' '} ${String(n).padStart(width)} | ${text}`)
    if (n === lineNumber) {
      const indent = /^\s*/.exec(text)?.[0].length ?? 0
      frame.push(`  ${' '.repeat(width)} | ${' '.repeat(indent)}^ ${note}`)
    }
  }
  return frame.join('\n')
}

const banner = (label: string): string => `──────────────── ${label} ────────────────`

// throw without a stack trace, so jest prints only the code frames of the
// locale files instead of a useless frame of this test file
const failWith = (message: string): never => {
  const error = new Error(`${banner('✖ ERROR')}\n${message}`)
  error.stack = error.message
  throw error
}

// Longest increasing subsequence — the keys NOT in it are the minimal set of
// out-of-place keys, so one moved key is reported once, not as a cascade.
const inLongestIncreasingSubsequence = (seq: number[]): boolean[] => {
  const lengthTo = seq.map(() => 1)
  const prev = seq.map(() => -1)
  let best = 0
  for (let i = 0; i < seq.length; i++) {
    for (let j = 0; j < i; j++) {
      if (seq[j] < seq[i] && lengthTo[j] + 1 > lengthTo[i]) {
        lengthTo[i] = lengthTo[j] + 1
        prev[i] = j
      }
    }
    if (lengthTo[i] > lengthTo[best]) best = i
  }
  const result = seq.map(() => false)
  for (let i = best; i >= 0; i = prev[i]) result[i] = true
  return result
}

// ---------------------------------------------------------------------------

describe('locale files are in sync', () => {
  test.each(languages.filter((lang) => lang !== REFERENCE))(
    `%s keys are ordered like ${REFERENCE}`,
    (lang) => {
      const langKeys = new Set(flatKeys[lang])
      const referenceKeys = new Set(flatKeys[REFERENCE])
      const commonInReferenceOrder = flatKeys[REFERENCE].filter((key) => langKeys.has(key))
      const commonInLangOrder = flatKeys[lang].filter((key) => referenceKeys.has(key))

      const positionInReference = new Map(commonInReferenceOrder.map((key, i) => [key, i]))
      const keep = inLongestIncreasingSubsequence(
        commonInLangOrder.map((key) => positionInReference.get(key) ?? -1),
      )
      const misplaced = commonInLangOrder.filter((_, i) => !keep[i])

      if (misplaced.length > 0) {
        const correctlyPlaced = new Set(commonInLangOrder.filter((_, i) => keep[i]))
        const parentOf = (key: string): string => key.slice(0, Math.max(0, key.lastIndexOf('.')))
        const frames = misplaced.map((key) => {
          // anchor on the next SIBLING that is itself correctly placed: inserting
          // right before a key at the same nesting depth is bracket-exact, while
          // "insert after X" can land inside X's nested block. No such sibling →
          // skip the target frame rather than give fragile advice.
          const refPosition = positionInReference.get(key) ?? 0
          const isStableSibling = (candidate: string) =>
            parentOf(candidate) === parentOf(key) && correctlyPlaced.has(candidate)
          const nextSibling = commonInReferenceOrder.slice(refPosition + 1).find(isStableSibling)
          const prevSibling = nextSibling
            ? undefined
            : commonInReferenceOrder.slice(0, refPosition).reverse().find(isStableSibling)
          const currentLocation = codeFrame(
            lang,
            key,
            nextSibling
              ? `out of order — in ${REFERENCE}.json this key comes before "${nextSibling}"`
              : prevSibling
                ? `out of order — in ${REFERENCE}.json this key comes after "${prevSibling}"`
                : 'out of order',
          )
          const referenceOrder = codeFrame(REFERENCE, key, `this is its place in ${REFERENCE}.json`)
          return `${currentLocation}\n \n${referenceOrder}`
        })
        failWith(
          `${misplaced.length} key(s) in ${lang}.json are not in ${REFERENCE}.json order:\n\n${frames.join('\n \n')}`,
        )
      }
    },
  )

  // en and he are mandatory for every key (en is the i18next type source, he the
  // fallbackLng) — a key missing from either throws. ru and ar are allowed to lag:
  // a key present in en+he but missing one or both only warns.
  const REQUIRED = ['en', 'he']
  test('every key exists in en+he; missing ru/ar only warns', () => {
    const keyToLanguages = new Map<string, string[]>()
    for (const lang of languages) {
      for (const key of flatKeys[lang]) {
        keyToLanguages.set(key, [...(keyToLanguages.get(key) ?? []), lang])
      }
    }

    const errors: string[] = []
    const awaitingTranslation: string[] = []
    for (const [key, langs] of keyToLanguages) {
      if (langs.length === languages.length) continue
      const missing = languages.filter((lang) => !langs.includes(lang))
      const missingRequired = missing.filter((lang) => REQUIRED.includes(lang))
      if (missingRequired.length > 0) {
        const holder = langs.includes(REFERENCE) ? REFERENCE : langs[0]
        errors.push(
          codeFrame(
            holder,
            key,
            `exists only in [${langs.join(', ')}] — missing from required ${missingRequired.join(', ')}`,
          ),
        )
      } else {
        // en+he present, only ru and/or ar missing — let it lag, just warn
        awaitingTranslation.push(key)
      }
    }

    if (awaitingTranslation.length > 0) {
      // group by top-level key so 200 untranslated leaves of one page print as one line
      const byPrefix = new Map<string, number>()
      for (const key of awaitingTranslation) {
        const prefix = key.split('.')[0]
        byPrefix.set(prefix, (byPrefix.get(prefix) ?? 0) + 1)
      }
      const summary = [...byPrefix]
        .map(([prefix, count]) => (count === 1 ? prefix : `${prefix}.* (${count} keys)`))
        .join(', ')
      // not console.warn — jest decorates intercepted console calls with a
      // useless code frame of this test file
      process.stderr.write(
        `\n${banner('⚠ WARNING')}\n${awaitingTranslation.length} keys exist in en+he but are missing ru and/or ar translation: ${summary}\n\n`,
      )
    }

    if (errors.length > 0) {
      failWith(
        `${errors.length} key(s) are missing a required en/he translation:\n\n${errors.join('\n \n')}`,
      )
    }
  })
})
