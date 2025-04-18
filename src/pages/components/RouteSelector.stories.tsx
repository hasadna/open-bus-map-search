import type { Meta, StoryObj } from '@storybook/react'
import RouteSelector from './RouteSelector'
import { fromGtfsRoute } from 'src/model/busRoute'

const d = [
  {
    id: 6772443,
    date: new Date('2025-04-16'),
    lineRef: 2974,
    operatorRef: 3,
    routeShortName: '1',
    routeLongName: 'שדרות מנחם בגין/כביש 7-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-3#',
    routeMkt: '33001',
    routeDirection: '3',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
  {
    id: 6772555,
    date: new Date('2025-04-16'),
    lineRef: 4181,
    operatorRef: 3,
    routeShortName: '1',
    routeLongName: 'חניון אגד/הנפח-כרמיאל<->הנפח/היזם-כרמיאל-3#',
    routeMkt: '14001',
    routeDirection: '3',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
  {
    id: 6772594,
    date: new Date('2025-04-16'),
    lineRef: 4543,
    operatorRef: 3,
    routeShortName: '1',
    routeLongName: 'הנדיב/המייסדים-זכרון יעקב<->הנדיב/המייסדים-זכרון יעקב-3#',
    routeMkt: '16001',
    routeDirection: '3',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
  {
    id: 6772595,
    date: new Date('2025-04-16'),
    lineRef: 4547,
    operatorRef: 3,
    routeShortName: '1',
    routeLongName: 'בית ספר אלונים/הבנים-פרדס חנה כרכור<->יד לבנים/דרך הבנים-פרדס חנה כרכור-3#',
    routeMkt: '17001',
    routeDirection: '3',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
  {
    id: 6773683,
    date: new Date('2025-04-16'),
    lineRef: 11888,
    operatorRef: 3,
    routeShortName: '1',
    routeLongName: 'הנדיב/המייסדים-זכרון יעקב<->הנדיב/המייסדים-זכרון יעקב-3ח',
    routeMkt: '16001',
    routeDirection: '3',
    routeAlternative: 'ח',
    agencyName: 'אגד',
    routeType: '3',
  },
]

const exempleRouts = d.map(fromGtfsRoute)

const meta: Meta<typeof RouteSelector> = {
  title: 'Components/RouteSelector',
  component: RouteSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    routeKey: {
      control: { type: 'text' },
      description: 'The key of the selected route',
      table: {
        type: { summary: 'string' },
      },
    },
    routes: {
      control: { type: 'object' },
      description: 'List of available routes',
      table: {
        type: { summary: 'Array<Route>' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the route selector',
      table: {
        type: { summary: 'boolean' },
      },
    },
    setRouteKey: {
      action: 'setRouteKey',
      description: 'Callback function triggered when a route is selected',
      table: {
        type: { summary: '(routeKey: string) => void' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof RouteSelector>

export const Default: Story = {
  args: {
    routes: exempleRouts,
  },
}

export const RoutesSelected: Story = {
  args: {
    routes: exempleRouts,
    routeKey: 'הנדיב/המייסדים-זכרון יעקב<->הנדיב/המייסדים-זכרון יעקב-3#',
  },
}

export const EmptyRouteList: Story = {
  args: {
    routes: [],
  },
}

export const DisabledRouteList: Story = {
  args: {
    routes: [],
    disabled: true,
  },
}
