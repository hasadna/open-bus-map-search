import {
  AggregationsApi,
  Configuration,
  GtfsApi,
  HealthApi,
  IssuesApi,
  SiriApi,
  UserCasesApi,
} from '@hasadna/open-bus-api-client'
import {
  ComplaintsApi,
  Configuration as ConfigurationDEV,
} from 'D:\\WEB\\open-bus-api-client\\client\\src'
import { setStrideLiteApiBasePath, strideApiBasePath } from './strideLite'

export const STRIDE_API_BASE_PATH = strideApiBasePath()
export const STRIDE_API_CONFIG = new Configuration({ basePath: STRIDE_API_BASE_PATH })

/** Apply a runtime backend change to the shared config used by all generated API clients. */
export const applyStrideApiBasePath = (basePath?: string): void => {
  if (basePath !== undefined) setStrideLiteApiBasePath(basePath)
  STRIDE_API_CONFIG.config = new Configuration({ basePath: strideApiBasePath() })
}

export const AGGREGATIONS_API = new AggregationsApi(STRIDE_API_CONFIG)
export const GTFS_API = new GtfsApi(STRIDE_API_CONFIG)
export const SIRI_API = new SiriApi(STRIDE_API_CONFIG)
export const USER_CASE_API = new UserCasesApi(STRIDE_API_CONFIG)

export const BACKEND_API_BASE_PATH = process.env.VITE_BACKEND_API
const BACKEND_API_CONFIG = new Configuration({ basePath: BACKEND_API_BASE_PATH })
const BACKEND_API_CONFIG_DEV = new ConfigurationDEV({ basePath: 'http://127.0.0.1:3001' })

export const HEALTH_API = new HealthApi(BACKEND_API_CONFIG)
export const ISSUES_API = new IssuesApi(BACKEND_API_CONFIG)
export const COMPLAINTS_API = new ComplaintsApi(BACKEND_API_CONFIG_DEV)
export const MAX_HITS_COUNT = 16
