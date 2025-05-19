import type { Meta, StoryObj } from '@storybook/react'

import { LineProfileDetails } from './LineProfileDetails'

const meta = {
  component: LineProfileDetails,
  tags: ['autodocs'],
  title: 'Pages/Profile/LineProfileDetails',

  argTypes: {
    id: {
      control: 'number',
      description: 'The id of the line profile.',
    },
    date: {
      control: 'date',
      description: 'The date of the line profile.',
    },
    lineRef: {
      control: 'number',
      description: 'The line reference of the line profile.',
    },
    operatorRef: {
      control: 'number',
      description: 'The operator reference of the line profile.',
    },
    routeShortName: {
      control: 'text',
      description: 'The short name of the route.',
    },
    routeLongName: {
      control: 'text',
      description: 'The long name of the route.',
    },
    routeMkt: {
      control: 'text',
      description: 'The route market of the route.',
    },
    routeDirection: {
      control: 'text',
      description: 'The direction of the route.',
    },
    routeAlternative: {
      control: 'text',
      description: 'The alternative of the route.',
    },
    agencyName: {
      control: 'text',
      description: 'The name of the agency.',
    },
    routeType: {
      control: 'text',
      description: 'The type of the route.',
    },
  },
} satisfies Meta<typeof LineProfileDetails>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 4335451,
    date: new Date('Mon Feb 12 2024 02:00:00 GMT+0200 (Israel Standard Time)'),
    lineRef: 3644,
    operatorRef: 3,
    routeShortName: '18',
    routeLongName: 'ת. רכבת בת גלים-חיפה<->חניון נווה שאנן-חיפה-1#',
    routeMkt: '10018',
    routeDirection: '1',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
}
