export type ChallengeTier = 'starter' | 'intermediate' | 'advanced'
export type Track = 'harness' | 'ai-readiness' | 'mapping' | 'data'

export interface Challenge {
  id: string
  tier: ChallengeTier
  track: Track
  sizedMinutes: 30 | 60 | 90
  stack: string[]
  domainExpertFriendly: boolean
  startingPoints: { labelKey: string; href: string }[]
}

export const REGISTRATION_CLOSE_ISO = '2026-06-03T23:59:00+03:00'
export const EVENT_DATE_ISO = '2026-06-09T18:00:00+03:00'
export const REGISTRATION_FORM_URL =
  'https://docs.google.com/forms/d/e/PLACEHOLDER/viewform?embedded=true'

export const CHALLENGES: Challenge[] = [
  {
    id: 'harness-tests-ci',
    tier: 'intermediate',
    track: 'harness',
    sizedMinutes: 60,
    stack: ['Jest', 'GitHub Actions', 'TypeScript'],
    domainExpertFriendly: false,
    startingPoints: [
      {
        labelKey: 'links.existing_tests',
        href: 'https://github.com/hasadna/open-bus-map-search/blob/main/src/api/serviceDayRoutesService.test.ts',
      },
      {
        labelKey: 'links.offline_tests_workflow',
        href: 'https://github.com/hasadna/open-bus-map-search/blob/main/.github/workflows/offline-tests.yml',
      },
    ],
  },
  {
    id: 'harness-backend-devenv',
    tier: 'advanced',
    track: 'harness',
    sizedMinutes: 90,
    stack: ['Python', 'devcontainer', 'Claude skills', 'stride-client'],
    domainExpertFriendly: false,
    startingPoints: [
      {
        labelKey: 'links.pipelines_repo',
        href: 'https://github.com/hasadna/open-bus-pipelines',
      },
      {
        labelKey: 'links.stride_client_repo',
        href: 'https://github.com/hasadna/open-bus-stride-client',
      },
    ],
  },
  {
    id: 'harness-skill-backend-tests',
    tier: 'intermediate',
    track: 'harness',
    sizedMinutes: 60,
    stack: ['Claude skills', 'Python', 'pytest', 'test authoring'],
    domainExpertFriendly: false,
    startingPoints: [
      {
        labelKey: 'links.claude_skills_docs',
        href: 'https://docs.claude.com/en/docs/claude-code/skills',
      },
      {
        labelKey: 'links.pipelines_repo',
        href: 'https://github.com/hasadna/open-bus-pipelines',
      },
    ],
  },
  {
    id: 'harness-hooks-gate',
    tier: 'advanced',
    track: 'harness',
    sizedMinutes: 90,
    stack: ['Claude hooks', 'bash', 'CI'],
    domainExpertFriendly: false,
    startingPoints: [
      {
        labelKey: 'links.claude_hooks_docs',
        href: 'https://docs.claude.com/en/docs/claude-code/hooks',
      },
    ],
  },
  {
    id: 'ai-llms-txt',
    tier: 'starter',
    track: 'ai-readiness',
    sizedMinutes: 30,
    stack: ['Markdown', 'content'],
    domainExpertFriendly: false,
    startingPoints: [
      { labelKey: 'links.llms_txt_spec', href: 'https://llmstxt.org/' },
      { labelKey: 'links.databus_repo', href: 'https://github.com/hasadna/open-bus-map-search' },
    ],
  },
  {
    id: 'ai-markdown-export',
    tier: 'intermediate',
    track: 'ai-readiness',
    sizedMinutes: 60,
    stack: ['React', 'TypeScript', 'routing'],
    domainExpertFriendly: false,
    startingPoints: [
      { labelKey: 'links.line_profile', href: 'https://www.databus.org.il/profile/' },
    ],
  },
  {
    id: 'ai-mcp-prototype',
    tier: 'advanced',
    track: 'ai-readiness',
    sizedMinutes: 90,
    stack: ['MCP', 'Python/Node', 'API'],
    domainExpertFriendly: false,
    startingPoints: [
      { labelKey: 'links.mcp_spec', href: 'https://modelcontextprotocol.io/' },
      { labelKey: 'links.stride_api', href: 'https://open-bus-stride-api.hasadna.org.il/docs' },
      { labelKey: 'links.stride_api_repo', href: 'https://github.com/hasadna/open-bus-stride-api' },
    ],
  },
  {
    id: 'mapping-stride-audit',
    tier: 'starter',
    track: 'mapping',
    sizedMinutes: 60,
    stack: ['Python', 'Jupyter', 'documentation'],
    domainExpertFriendly: true,
    startingPoints: [
      {
        labelKey: 'links.stride_client_repo',
        href: 'https://github.com/hasadna/open-bus-stride-client',
      },
      {
        labelKey: 'links.stride_notebooks',
        href: 'https://github.com/hasadna/open-bus-stride-client/tree/main/notebooks',
      },
      {
        labelKey: 'links.figma_designs',
        href: 'https://www.figma.com/file/Plw8Uuu6U96CcX5tJyRMoW/Public-Transportation-visual-informaiton?node-id=0%3A1',
      },
    ],
  },
  {
    id: 'mapping-resurrect-pr',
    tier: 'intermediate',
    track: 'mapping',
    sizedMinutes: 90,
    stack: ['Git', 'React', 'TypeScript'],
    domainExpertFriendly: false,
    startingPoints: [
      {
        labelKey: 'links.stale_prs',
        href: 'https://github.com/hasadna/open-bus-map-search/pulls?q=is%3Apr+is%3Aclosed+sort%3Aupdated-desc',
      },
      {
        labelKey: 'links.figma_designs',
        href: 'https://www.figma.com/file/Plw8Uuu6U96CcX5tJyRMoW/Public-Transportation-visual-informaiton?node-id=0%3A1',
      },
    ],
  },
  {
    id: 'data-new-chart',
    tier: 'starter',
    track: 'data',
    sizedMinutes: 60,
    stack: ['React', 'Recharts', 'TypeScript'],
    domainExpertFriendly: true,
    startingPoints: [
      { labelKey: 'links.gaps_page', href: 'https://www.databus.org.il/gaps' },
      { labelKey: 'links.line_profile', href: 'https://www.databus.org.il/profile/' },
    ],
  },
  {
    id: 'data-arrival-gap-fix',
    tier: 'intermediate',
    track: 'data',
    sizedMinutes: 90,
    stack: ['TypeScript', 'algorithms', 'tests'],
    domainExpertFriendly: true,
    startingPoints: [
      {
        labelKey: 'links.gaps_service',
        href: 'https://github.com/hasadna/open-bus-map-search/blob/main/src/api/gapsService.ts',
      },
      {
        labelKey: 'links.data_model',
        href: 'https://github.com/hasadna/open-bus-stride-db/blob/main/DATA_MODEL.md',
      },
    ],
  },
  {
    id: 'data-bus-bunching',
    tier: 'advanced',
    track: 'data',
    sizedMinutes: 90,
    stack: ['SIRI', 'algorithms', 'data analysis'],
    domainExpertFriendly: true,
    startingPoints: [
      {
        labelKey: 'links.siri_docs',
        href: 'https://en.wikipedia.org/wiki/Service_Interface_for_Real_Time_Information',
      },
      {
        labelKey: 'links.data_model',
        href: 'https://github.com/hasadna/open-bus-stride-db/blob/main/DATA_MODEL.md',
      },
      {
        labelKey: 'links.stride_api',
        href: 'https://open-bus-stride-api.hasadna.org.il/docs',
      },
    ],
  },
]
