import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Widget from 'src/shared/Widget'

import './VersionInfo.scss'

const versionUrl = 'https://open-bus-map-search.hasadna.org.il/hash.txt'

export const VersionInfo = () => {
  const { t } = useTranslation()
  const {
    data: version,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['version'],
    queryFn: () => fetch(versionUrl).then((response) => response.text()),
  })
  return (
    <Widget>
      <h2>{t('version')}</h2>
      {isLoading && <p>{t('loading')}</p>}
      {isError && <p>{t('failedToFetchVersion')}</p>}
      {version && <p>{version}</p>}
    </Widget>
  )
}
