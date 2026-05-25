import { CheckOutlined, LinkOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { SearchContext } from 'src/model/globalState'
import { ExtraShareParamsContext } from 'src/model/routeContext'
import { buildShareUrl } from './shareUrl'

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

  const tooltipTitle = copied ? (
    <span>{t('link_copied')}</span>
  ) : (
    <span>
      {t('share_link')}
      <br />
      <span style={{ opacity: 0.75, fontSize: '0.85em', wordBreak: 'break-all' }}>{shareUrl}</span>
    </span>
  )

  return (
    <Tooltip title={tooltipTitle} open={copied || undefined} placement="bottomRight">
      <div
        className="header-link"
        onClick={handleShare}
        aria-label={copied ? t('link_copied') : t('share_link')}
        style={{ cursor: 'pointer' }}>
        {copied ? <CheckOutlined /> : <LinkOutlined />}
      </div>
    </Tooltip>
  )
}
