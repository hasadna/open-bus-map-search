import {
  AggregationsApi,
  ComplaintsApi,
  Configuration,
  GovernmentTransportationApi,
  GtfsApi,
  HealthApi,
  IssuesApi,
  SiriApi,
} from '@hasadna/open-bus-api-client'

export const STRIDE_API_BASE_PATH = process.env.VITE_STRIDE_API
const STRIDE_API_CONFIG = new Configuration({ basePath: STRIDE_API_BASE_PATH })

export const AGGREGATIONS_API = new AggregationsApi(STRIDE_API_CONFIG)
export const GTFS_API = new GtfsApi(STRIDE_API_CONFIG)
export const SIRI_API = new SiriApi(STRIDE_API_CONFIG)

const BACKEND_API_BASE_PATH = process.env.VITE_BACKEND_API
const BACKEND_API_CONFIG = new Configuration({ basePath: BACKEND_API_BASE_PATH })

export const HEALTH_API = new HealthApi(BACKEND_API_CONFIG)
export const ISSUES_API = new IssuesApi(BACKEND_API_CONFIG)
export const COMPLAINTS_API = new ComplaintsApi(BACKEND_API_CONFIG)
export const GOVERNMENT_TRANSPORTATION_API = new GovernmentTransportationApi(BACKEND_API_CONFIG)

export const MAX_HITS_COUNT = 16
