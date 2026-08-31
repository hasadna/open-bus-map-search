export type Author = {
  avatar_url: string
  contributions: number
  html_url: string
  id: number
  login: string
  node_id: string
  organizations_url: string
  received_events_url: string
  repos_url: string
  site_admin: boolean
  starred_url: string
  subscriptions_url: string
  type: string
  url: string
}

export const CONTRIBUTOR_REPOS = [
  'open-bus-map-search',
  'open-bus-stride-api',
  'open-bus-backend',
  'open-bus-pipelines',
  'open-bus-siri-requester',
  'open-bus-gtfs-etl',
  'open-bus-stride-etl',
]

export async function fetchRepoContributors(repo: string): Promise<Author[]> {
  const contributors: Author[] = []
  let url: string | undefined =
    `https://api.github.com/repos/hasadna/${repo}/contributors?per_page=100`

  while (url) {
    const res: Response = await fetch(url)
    // an unhandled 403 (the 60/hour unauthenticated rate limit) parses as a plain error
    // object, which would silently drop the whole repo from the totals
    if (!res.ok) throw new Error(`GitHub responded ${res.status} for ${repo}`)
    // 204 = a repo nobody has contributed to yet, and it carries no body to parse
    if (res.status === 204) break
    contributors.push(...((await res.json()) as Author[]))
    url = nextPageUrl(res.headers.get('link'))
  }

  return contributors
}

/** GitHub caps a page at 100 entries and points at the rest through the Link header. */
function nextPageUrl(linkHeader: string | null) {
  return linkHeader?.match(/<([^>]+)>;\s*rel="next"/)?.[1]
}

/** One entry per person, contributions summed across repos, bots dropped. */
export function combineContributions(perRepo: Author[][]): Author[] {
  const combined = new Map<string, Author>()

  for (const author of perRepo.flat()) {
    if (author.type !== 'User') continue
    const sameUser = combined.get(author.login)
    // copy rather than reuse: `author` belongs to the react-query cache, and adding into it
    // there re-inflates the totals on every render and gets persisted to localStorage
    if (sameUser) sameUser.contributions += author.contributions
    else combined.set(author.login, { ...author })
  }

  return [...combined.values()].sort((a, b) => b.contributions - a.contributions)
}
