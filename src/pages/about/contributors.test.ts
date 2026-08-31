import { Author, combineContributions, fetchRepoContributors } from './contributors'

const author = (fields: Partial<Author>): Author =>
  ({ type: 'User', contributions: 1, ...fields }) as Author

const totals = (authors: Author[]) =>
  Object.fromEntries(authors.map((a) => [a.login, a.contributions]))

const githubResponse = (body: unknown, headers: Record<string, string> = {}) => ({
  ok: true,
  status: 200,
  headers: { get: (name: string) => headers[name] ?? null },
  json: () => Promise.resolve(body),
})

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('combineContributions', () => {
  it('sums one person across repos and sorts by the total', () => {
    const combined = combineContributions([
      [author({ login: 'ori', contributions: 80 }), author({ login: 'noam', contributions: 100 })],
      [author({ login: 'ori', contributions: 240 })],
    ])

    expect(combined.map((a) => a.login)).toEqual(['ori', 'noam'])
    expect(totals(combined)).toEqual({ ori: 320, noam: 100 })
  })

  it('drops bots', () => {
    const combined = combineContributions([
      [author({ login: 'allcontributors[bot]', type: 'Bot', contributions: 500 })],
      [author({ login: 'noam', contributions: 3 })],
    ])

    expect(totals(combined)).toEqual({ noam: 3 })
  })

  // regression: the old reduce added into the react-query cache's own objects, so every
  // re-render inflated cross-repo contributors further — and the persister wrote the
  // inflated totals to localStorage, carrying the drift across refreshes
  it('is pure — repeated calls on the same data give the same totals', () => {
    const perRepo = [
      [author({ login: 'ori', contributions: 80 })],
      [author({ login: 'ori', contributions: 240 })],
    ]

    expect(totals(combineContributions(perRepo))).toEqual({ ori: 320 })
    expect(totals(combineContributions(perRepo))).toEqual({ ori: 320 })
    expect(totals(combineContributions(perRepo))).toEqual({ ori: 320 })
    expect(perRepo.flat().map((a) => a.contributions)).toEqual([80, 240])
  })
})

describe('fetchRepoContributors', () => {
  it('follows the Link header so the list is not truncated at one page', async () => {
    const nextUrl = 'https://api.github.com/repositories/616824114/contributors?per_page=100&page=2'
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(
        githubResponse([author({ login: 'noam' })], { link: `<${nextUrl}>; rel="next"` }) as never,
      )
      .mockResolvedValueOnce(githubResponse([author({ login: 'ori' })]) as never)

    const contributors = await fetchRepoContributors('open-bus-map-search')

    expect(contributors.map((a) => a.login)).toEqual(['noam', 'ori'])
    expect(vi.mocked(global.fetch).mock.calls[1][0]).toBe(nextUrl)
  })

  // a rate-limited repo answers 403 with an error object, which used to pass through the
  // pipeline as zero contributors — the section silently shrank instead of reporting failure
  it('rejects on the rate-limit response instead of returning nothing', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'API rate limit exceeded' }),
    } as never)

    await expect(fetchRepoContributors('open-bus-map-search')).rejects.toThrow('403')
  })

  it('treats a repo with no contributors as empty rather than a parse error', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
      json: () => Promise.reject(new Error('no body')),
    } as never)

    await expect(fetchRepoContributors('open-bus-backend')).resolves.toEqual([])
  })
})
