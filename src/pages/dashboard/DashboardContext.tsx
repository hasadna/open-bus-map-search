import { FC, PropsWithChildren, createContext, useState, useEffect } from 'react'

export interface DashboardContextType {
  setAllLinesChartsIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setWorstLineIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setDayTimeChartIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setAllLinesChartsIsEmpty: React.Dispatch<React.SetStateAction<boolean>>
  setWorstLineIsEmpty: React.Dispatch<React.SetStateAction<boolean>>
  setDayTimeChartIsEmpty: React.Dispatch<React.SetStateAction<boolean>>
  isDataLoading: boolean
  isDataEmpty: boolean
}
export const DashboardCtx = createContext<DashboardContextType>({} as DashboardContextType)
export const DashboardContext: FC<PropsWithChildren> = ({ children }) => {
  // loading
  const [allLinesChartsIsLoading, setAllLinesChartsIsLoading] = useState(false)
  const [worstLineIsLoading, setWorstLineIsLoading] = useState(false)
  const [allDayTimeChartIsLoading, setDayTimeChartIsLoading] = useState(false)
  // is empty
  const [allLineChartsIsEmpty, setAllLinesChartsIsEmpty] = useState(false)
  const [worstLineIsEmpty, setWorstLineIsEmpty] = useState(false)
  const [dayTimeChartIsEmpty, setDayTimeChartIsEmpty] = useState(false)
  const [isDataEmpty, setIsDataEmpty] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)

  useEffect(() => {
    setIsDataEmpty(allLineChartsIsEmpty && worstLineIsEmpty && dayTimeChartIsEmpty)
  }, [allLineChartsIsEmpty, worstLineIsEmpty, dayTimeChartIsEmpty])

  useEffect(() => {
    setIsDataLoading(allLinesChartsIsLoading || worstLineIsLoading || allDayTimeChartIsLoading)
  }, [allLinesChartsIsLoading, worstLineIsLoading, allDayTimeChartIsLoading])

  return (
    <DashboardCtx.Provider
      value={{
        setAllLinesChartsIsLoading,
        setWorstLineIsLoading,
        setDayTimeChartIsLoading,
        setAllLinesChartsIsEmpty,
        setWorstLineIsEmpty,
        setDayTimeChartIsEmpty,
        isDataLoading,
        isDataEmpty,
      }}>
      {children}
    </DashboardCtx.Provider>
  )
}
