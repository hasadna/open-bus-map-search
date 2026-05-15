import { CheckOutlined, LinkOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { getPathWithoutLang } from 'src/locale/allTranslations'
import { ExtraShareParamsContext, PageSearchState, SearchContext } from 'src/model/pageState'

type ShareableKey = Exclude<keyof PageSearchState, 'routes'>

// Only include params that are actually used on each page
const PAGE_SHARE_PARAMS: Partial<Record<string, ShareableKey[]>> = {
  '/timeline': ['timestamp', 'operatorId', 'lineNumber', 'vehicleNumber', 'routeKey', 'startTime'],
  '/gaps': ['timestamp', 'operatorId', 'lineNumber', 'routeKey'],
  '/gaps_patterns': ['operatorId', 'lineNumber', 'routeKey'],
  '/map': [],
  '/velocity-heatmap': ['timestamp'],
  '/single-line-map': [
    'timestamp',
    'operatorId',
    'lineNumber',
    'vehicleNumber',
    'routeKey',
    'startTime',
  ],
  '/operator': ['operatorId', 'timestamp'],
}

const buildShareUrl = (
  pathname: string,
  search: PageSearchState,
  extraParams: Record<string, string>,
): string => {
  const pagePath = getPathWithoutLang(pathname)
  const relevantKeys = PAGE_SHARE_PARAMS[pagePath] ?? []

  const params = new URLSearchParams()

  for (const key of relevantKeys) {
    const value = search[key]
    if (value) params.set(key, String(value))
  }

  Object.entries(extraParams).forEach(([key, value]) => params.set(key, value))

  const query = params.toString()
  return `${window.location.origin}${pathname}${query ? `?${query}` : ''}`
}

export const ShareButton = () => {
  const { search } = useContext(SearchContext)
  const { params: extraParams } = useContext(ExtraShareParamsContext)
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const shareUrl = useMemo(
    () => buildShareUrl(location.pathname, search, extraParams),
    [location.pathname, search, extraParams],
  )

  const handleShare = useCallback(() => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        // clipboard API not available; silent fail
      })
  }, [shareUrl])

  const tooltipTitle = (
    <span>
      {t('share_link')}
      <br />
      <span style={{ opacity: 0.75, fontSize: '0.85em', wordBreak: 'break-all' }}>{shareUrl}</span>
    </span>
  )

  return (
    <Tooltip title={tooltipTitle} placement="bottomRight">
      <div
        className="header-link"
        onClick={handleShare}
        aria-label={t('share_link')}
        style={{ cursor: 'pointer' }}>
        {copied ? <CheckOutlined /> : <LinkOutlined />}
      </div>
    </Tooltip>
  )
}
