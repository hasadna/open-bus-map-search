import { USER_CASE_API } from './apiConfig'

export const getGapsAsync = (
  fromTimestamp: number,
  toTimestamp: number,
  operatorId: string,
  lineRef: number,
  limit = 10000,
) => {
  return USER_CASE_API.ridesExecutionListGet({
    dateFrom: new Date(fromTimestamp),
    dateTo: new Date(toTimestamp),
    limit,
    lineRef,
    operatorRef: operatorId ? parseInt(operatorId) : undefined,
  })
}
