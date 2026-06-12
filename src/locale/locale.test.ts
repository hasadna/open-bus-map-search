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

describe('locale files are in sync', () => {
  test.each(languages.filter((lang) => lang !== REFERENCE))(
    `%s keys are ordered like ${REFERENCE}`,
    (lang) => {
      const langKeys = new Set(flatKeys[lang])
      const referenceKeys = new Set(flatKeys[REFERENCE])
      const commonInReferenceOrder = flatKeys[REFERENCE].filter((key) => langKeys.has(key))
      const commonInLangOrder = flatKeys[lang].filter((key) => referenceKeys.has(key))
      expect(commonInLangOrder).toEqual(commonInReferenceOrder)
    },
  )

  test('every key is either in all languages or a new en+he key awaiting translation', () => {
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
      if (langs.length === 2 && langs.includes('en') && langs.includes('he')) {
        awaitingTranslation.push(key)
      } else {
        errors.push(`"${key}" exists only in [${langs.join(', ')}]`)
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
      console.warn(
        `${awaitingTranslation.length} keys exist only in en+he, awaiting ru/ar translation: ${summary}`,
      )
    }

    expect(errors).toEqual([])
  })
})
