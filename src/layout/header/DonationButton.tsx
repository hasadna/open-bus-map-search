import { DollarOutlined } from '@ant-design/icons'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DonateModal from 'src/pages/DonateModal/DonateModal'

export const DonationButton = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const tooltip_title = t('donate_title')

  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)
  return (
    <>
      <IconButton size="small" onClick={onOpen} aria-label={tooltip_title} title={tooltip_title}>
        <DollarOutlined />
      </IconButton>
      <DonateModal isVisible={open} onClose={onClose} />
    </>
  )
}
