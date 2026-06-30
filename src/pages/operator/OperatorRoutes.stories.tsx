import type { Meta, StoryObj } from '@storybook/react-vite'
import { delay, http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { formatIsraelDate } from 'src/dayjs'
import i18n from 'src/locale/allTranslations'
import { ISRAEL_TRAIN_ID } from 'src/model/operator'
import { getPastDate } from '../../../.storybook/main'
import { OperatorRoutes } from './OperatorRoutes'

const DATE = formatIsraelDate(getPastDate())

// MSW matches by pathname (query params are ignored), so a single wildcard
// handler serves every operatorId/limit/date the component asks for.
const routesHandler = (resolver: Parameters<typeof http.get>[1]) =>
  http.get('*/gtfs_routes/list', resolver)

// The mock dataset is the full אגד route list (1243 routes → 354 line groups),
// shared with the e2e HAR, so the line/city assertions below stay in sync.
const withRoutes = routesHandler(async () => {
  const { operatorRoutes } = await import('../../../.storybook/mockData')
  return HttpResponse.json(operatorRoutes)
})

// Real רכבת ישראל (operator 2) routes, fetched verbatim from the Stride API
// (gtfs_routes/list?operator_refs=2) for 2024-02-12 — the same date the rest of
// the fixtures/HAR use. Note: train routes carry route_short_name "NaN" and null
// mkt/direction, so the component's line-grouping collapses them all into a single
// blank-labelled group — this is the real train UX, not a fixture artifact.
const trainRoutes = [
  {
    id: 4340570,
    date: '2024-02-12',
    line_ref: 30867,
    operator_ref: 2,
    route_short_name: 'NaN',
    route_long_name: 'אשדוד עד הלום-אשדוד<->הרצליה-הרצליה',
    route_mkt: null,
    route_direction: null,
    route_alternative: null,
    agency_name: 'רכבת ישראל',
    route_type: '2',
  },
  {
    id: 4340923,
    date: '2024-02-12',
    line_ref: 34237,
    operator_ref: 2,
    route_short_name: 'NaN',
    route_long_name: 'אשקלון-אשקלון<->באר שבע מרכז-באר שבע',
    route_mkt: null,
    route_direction: null,
    route_alternative: null,
    agency_name: 'רכבת ישראל',
    route_type: '2',
  },
  {
    id: 4340272,
    date: '2024-02-12',
    line_ref: 30115,
    operator_ref: 2,
    route_short_name: 'NaN',
    route_long_name: 'באר שבע מרכז-באר שבע<->חיפה מרכז-חיפה',
    route_mkt: null,
    route_direction: null,
    route_alternative: null,
    agency_name: 'רכבת ישראל',
    route_type: '2',
  },
  {
    id: 4341008,
    date: '2024-02-12',
    line_ref: 35578,
    operator_ref: 2,
    route_short_name: 'NaN',
    route_long_name: 'בנימינה-בנימינה גבעת עדה<->ירושלים/יצחק נבון-ירושלים',
    route_mkt: null,
    route_direction: null,
    route_alternative: null,
    agency_name: 'רכבת ישראל',
    route_type: '2',
  },
  {
    id: 4340572,
    date: '2024-02-12',
    line_ref: 30873,
    operator_ref: 2,
    route_short_name: 'NaN',
    route_long_name: 'הרצליה-הרצליה<->אשדוד עד הלום-אשדוד',
    route_mkt: null,
    route_direction: null,
    route_alternative: null,
    agency_name: 'רכבת ישראל',
    route_type: '2',
  },
]

const withTrainRoutes = routesHandler(() => HttpResponse.json(trainRoutes))

// Read the line labels rendered in the (collapsed) accordion headers.
const groupLabels = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.MuiAccordionSummary-content strong')).map((el) =>
    el.textContent?.trim(),
  )

const meta = {
  component: OperatorRoutes,
  title: 'Pages/Operator/OperatorRoutes',
  argTypes: {
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
    date: {
      control: 'text',
      description: 'The date of the chart (YYYY-MM-DD).',
    },
  },
  args: {
    operatorId: '3',
    date: DATE,
  },
  parameters: {
    msw: { handlers: [withRoutes] },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OperatorRoutes>

export default meta

type Story = StoryObj<typeof meta>

/** Loaded list, all line groups collapsed. */
export const Default: Story = {}

/** Skeleton placeholder while the routes request is in flight. */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        routesHandler(async () => {
          await delay('infinite')
          return HttpResponse.json([])
        }),
      ],
    },
  },
}

/** Operator with no routes for the selected date — no search box, no list. */
export const Empty: Story = {
  parameters: {
    msw: { handlers: [routesHandler(() => HttpResponse.json([]))] },
  },
}

/** First line group expanded to reveal the desktop route table. */
export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstGroup = await waitFor(() =>
      canvasElement.querySelector<HTMLElement>('.MuiAccordionSummary-root'),
    )
    await userEvent.click(firstGroup!)
    // the desktop table header should now be visible
    await waitFor(() => expect(canvas.getByText(i18n.t('operator.origin'))).toBeVisible())
  },
}

/**
 * Search by a line-number substring: "33" surfaces exactly the lines whose
 * number contains it — 33, 33א, 133, 433 (and nothing else).
 */
export const SearchByLine: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = await waitFor(() => canvas.getByRole('textbox'))
    await userEvent.type(search, '33')
    await waitFor(() => expect(groupLabels(canvasElement)).toEqual(['33', '33א', '133', '433']))
  },
}

/** Search by a place name filters the list down to the lines serving it. */
export const SearchByCity: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = await waitFor(() => canvas.getByRole('textbox'))
    await userEvent.type(search, 'קרית שמונה')
    await waitFor(() => {
      const labels = groupLabels(canvasElement)
      expect(labels.length).toBeGreaterThan(0)
      expect(labels.length).toBeLessThan(354)
    })
  },
}

/** Query that matches nothing shows the empty-results message. */
export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = await waitFor(() => canvas.getByRole('textbox'))
    await userEvent.type(search, 'zzqqxx')
    await waitFor(() => expect(canvas.getByText(i18n.t('operator.no_results'))).toBeVisible())
  },
}

/**
 * Train operator (id 2) with real רכבת ישראל routes. Trains have no line number,
 * so they all fall under one blank-labelled group; it's expanded here to show the
 * route rows have a "profile" link but no "map" link.
 */
export const TrainOperator: Story = {
  args: {
    operatorId: ISRAEL_TRAIN_ID,
    date: DATE,
  },
  parameters: {
    msw: { handlers: [withTrainRoutes] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const firstGroup = await waitFor(() =>
      canvasElement.querySelector<HTMLElement>('.MuiAccordionSummary-root'),
    )
    await userEvent.click(firstGroup!)
    await waitFor(() =>
      expect(canvas.getAllByText(i18n.t('operator.profile')).length).toBeGreaterThan(0),
    )
    expect(canvas.queryByText(i18n.t('operator.map'))).toBeNull()
  },
}
