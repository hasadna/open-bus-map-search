import moment from 'moment'

export type GapsList = {
  siriTime: moment.Moment | undefined
  gtfsTime: moment.Moment | undefined
}[]
