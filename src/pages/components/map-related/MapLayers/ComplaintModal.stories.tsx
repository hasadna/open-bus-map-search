import type { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { mocked } from 'storybook/test'
import { useBusOperatorQuery, useCitiesQuery } from 'src/hooks/useFormQuerys'
import type { BusToolTipProps } from './BusToolTip'
import ComplaintModal from './ComplaintModal'

const meta = {
  title: 'Map/Layers/ComplaintModal',
  component: ComplaintModal,
  parameters: {
    layout: 'centered',
    eyes: {
      waitBeforeCapture: 'button[type="submit"]',
    },
  },
  argTypes: {
    modalOpen: {
      control: 'boolean',
    },
    setModalOpen: {
      action: 'setModalOpen',
    },
    position: {
      control: 'object',
      description: 'The position of the bus',
      table: {
        type: { summary: 'BusToolTipProps' },
      },
    },
  },
  decorators: [
    (Story, meta) => {
      const [modalOpen, setModalOpen] = useState(meta.args.modalOpen)

      return (
        <>
          <button
            onClick={() => {
              setModalOpen(true)
              meta.args.setModalOpen?.(true)
            }}>
            Open Model
          </button>
          <Story
            args={{
              ...meta.args,
              modalOpen,
              setModalOpen: (open) => {
                setModalOpen(open)
                meta.args.setModalOpen?.(open)
              },
            }}
          />
        </>
      )
    },
  ],
} satisfies Meta<typeof ComplaintModal>

export default meta

type Story = StoryObj<typeof meta>

const defaultArgs: BusToolTipProps & { route: GtfsRoutePydanticModel } = {
  position: {
    loc: [31.799982, 34.786926],
    color: 22,
    operator: 3,
    bearing: 106,
    recordedAtTime: 1698809440000,
    point: {
      id: 2838516282,
      siriSnapshotId: 919509,
      siriRideStopId: 1370461085,
      recordedAtTime: new Date('2023-11-01T03:30:40+00:00'),
      lon: 34.786926,
      lat: 31.799982,
      bearing: 106,
      velocity: 22,
      distanceFromJourneyStart: 636,
      distanceFromSiriRideStopMeters: 278,
      siriSnapshotSnapshotId: '2023/11/01/03/30',
      siriRouteId: 973,
      siriRouteLineRef: 2974,
      siriRouteOperatorRef: 3,
      siriRideId: 52703935,
      siriRideJourneyRef: '2023-11-01-56650774',
      siriRideScheduledStartTime: new Date('2023-11-01T03:30:00+00:00'),
      siriRideVehicleRef: '23321002',
      siriRideFirstVehicleLocationId: 2838509585,
      siriRideLastVehicleLocationId: 2838555351,
      siriRideDurationMinutes: 27,
      siriRideGtfsRideId: 57365030,
    },
  },
  icon: '/bus-logos/3.svg',
  route: {
    id: 125758768,
    date: new Date('2025-10-27'),
    lineRef: 19785,
    operatorRef: 3,
    routeShortName: '2',
    routeLongName: 'וייצמן/כצנלסון-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-1#',
    routeMkt: '81002',
    routeDirection: '1',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
}

export const Default: Story = {
  beforeEach: () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- partial UseQueryResult mock
    mocked(useBusOperatorQuery).mockReturnValue({
      data: [{ dataText: 'אגד', dataCode: 3 }],
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- partial UseQueryResult mock
    mocked(useCitiesQuery).mockReturnValue({
      data: [{ dataText: 'גדרה', dataCode: 2550 }],
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  },
  args: {
    position: defaultArgs.position,
    route: defaultArgs.route,
    modalOpen: true,
  },
}
