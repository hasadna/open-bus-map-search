import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import './VersionInfo.scss'
import Widget from 'src/shared/Widget'

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
    <Widget title={t('version')}>
      {isLoading && <p>{t('loading')}</p>}
      {isError && <p>{t('failedToFetchVersion')}</p>}
      {version && <p className="version">{version}</p>}
    </Widget>
  )
}
