import dayjs from 'src/dayjs'

export type Gap = {
  siriTime: dayjs.Dayjs | null
  gtfsTime: dayjs.Dayjs | null
}
export type GapsList = Gap[]
