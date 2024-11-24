import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarOutlined } from '@ant-design/icons'
import DonateModal from 'src/pages/DonateModal/DonateModal'

export const DonationButton = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const tooltip_title = t('donate_title')

  const onClose = () => setOpen(false)
  const onOpen = () => setOpen(true)

  return (
    <>
      <button
        className="theme-icon"
        onClick={onOpen}
        aria-label={tooltip_title}
        title={tooltip_title}>
        <DollarOutlined style={{ fontSize: '1.5em' }} />
      </button>
      <DonateModal isVisible={open} onClose={onClose} />
    </>
  )
}
