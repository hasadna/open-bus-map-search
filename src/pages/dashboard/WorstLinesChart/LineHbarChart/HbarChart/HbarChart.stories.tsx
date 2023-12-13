import type { Meta, StoryObj } from '@storybook/react'
import { HbarChart, Entry } from './HbarChart'

const meta = {
  title: 'Components/MapLayers/HbarChart',
  component: HbarChart,
  tags: ['map', 'tooltip', 'autodocs'],
} satisfies Meta<typeof HbarChart>

export default meta

type Story = StoryObj<typeof meta>

const operatorsPT: Entry[] = [
  {
    name: 'כפיר',
    total: 1883,
    actual: 0,
    color: '#5840c0',
  },
  {
    name: 'Unknown',
    total: 2318,
    actual: 0,
    color: '#2a443e',
  },
  {
    name: 'כרמלית',
    total: 998,
    actual: 0,
    color: '#5cbcec',
  },
  {
    name: 'כבל אקספרס',
    total: 12824,
    actual: 0,
    color: '#0d2b58',
  },
  {
    name: 'מועצה אזורית גולן',
    total: 1992,
    actual: 1506,
    color: '#957476',
  },
  {
    name: 'תנופה',
    total: 16291,
    actual: 14204,
    color: '#0f5019',
  },
  {
    name: 'גלים',
    total: 7444,
    actual: 6631,
    color: '#ee0abc',
  },
  {
    name: 'מועצה אזורית אילות',
    total: 271,
    actual: 244,
    color: '#39c53d',
  },
  {
    name: 'קווים',
    total: 81198,
    actual: 73282,
    color: '#03296A',
  },
  {
    name: 'אודליה מוניות בעמ',
    total: 125,
    actual: 113,
    color: '#89690a',
  },
  {
    name: 'בית שמש אקספרס',
    total: 15185,
    actual: 14362,
    color: '#3d5faa',
  },
  {
    name: 'נתיב אקספרס',
    total: 35021,
    actual: 33208,
    color: '#F2BD00',
  },
  {
    name: 'אקסטרה ירושלים',
    total: 12010,
    actual: 11409,
    color: '#b74477',
  },
  {
    name: 'אלקטרה אפיקים',
    total: 45647,
    actual: 43860,
    color: '#9ACA3C',
  },
  {
    name: 'סופרבוס',
    total: 57204,
    actual: 55687,
    color: '#164C8F',
  },
  {
    name: 'דן בדרום',
    total: 24060,
    actual: 23501,
    color: '#7aae7c',
  },
  {
    name: 'אגד',
    total: 135964,
    actual: 132832,
    color: '#008479',
  },
  {
    name: 'דן באר שבע',
    total: 18029,
    actual: 17663,
    color: '#2f3355',
  },
  {
    name: 'נסיעות ותיירות',
    total: 10471,
    actual: 10266,
    color: '#e7b513',
  },
  {
    name: 'מטרופולין',
    total: 56732,
    actual: 55626,
    color: '#FF8500',
  },
  {
    name: 'ש.א.מ',
    total: 15003,
    actual: 14721,
    color: '#bbaf73',
  },
  {
    name: 'גי.בי.טורס',
    total: 2678,
    actual: 2631,
    color: '#15d803',
  },
  {
    name: 'אגד תעבורה',
    total: 17644,
    actual: 17373,
    color: '#2f9250',
  },
  {
    name: 'דן',
    total: 67555,
    actual: 66979,
    color: '#205CAB',
  },
  {
    name: 'אקסטרה',
    total: 10597,
    actual: 10589,
    color: '#daa51a',
  },
]

export const Chart: Story = {
  args: {
    entries: operatorsPT,
    complement: false,
  },
}
