import { Configuration } from 'open-bus-stride-client'

//const BASE_PATH = 'http://localhost:3000/api'
export const BASE_PATH = import.meta.env.VITE_API_URI
export const API_CONFIG = new Configuration({ basePath: BASE_PATH })

export const MAX_HITS_COUNT = 16
