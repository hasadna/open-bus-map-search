import moment from 'moment'

export type GapsList = {
  siriTime: moment.Moment | null
  gtfsTime: moment.Moment | null
}[]
