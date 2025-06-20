import React from 'react'
import { Box, Grid, Modal, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ArrowBackIosNewRounded } from '@mui/icons-material'
interface DonateModalProps {
  isVisible: boolean
  onClose: () => void
}

const boxStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '1250px',
  maxHeight: 'calc(100vh - 210px)',
  overflowY: 'auto',
  width: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
} as const

const ButtonDonate = styled.a`
  direction: rtl;
  display: inline-flex;
  margin-left: auto;
  margin-right: 0;
  color: white;
  text-decoration: none;
  font-weight: bold;
`
const ButtonDonateText = styled.span`
  background-color: #16a9ff;
  padding: 8px 16px;
  border-radius: 0 1000px 1000px 0;
  font-size: 32px;
`

const ButtonDonateIcon = styled.span`
  padding: 16px;
  border-radius: 1000px 0 0 1000px;
  width: 32px;
  height: 32px;
  background-color: #1498e5;
`

export const DonateModal: React.FC<DonateModalProps> = ({ isVisible, onClose }) => {
  const shouldImgCollapse = useMediaQuery('(max-width: 950px)')
  const { t } = useTranslation()
  const { direction } = useTheme()

  return (
    <Modal
      open={isVisible}
      onClose={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        textAlign: `${direction === 'ltr' ? 'right' : 'left'}` as const,
        color: 'text.primary', // Dynamically uses the theme’s text color
      }}>
      <Box sx={boxStyle}>
        <button onClick={onClose} className="close-modal-icon">
          X
        </button>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {t('how_to_donate_title')}
        </Typography>
        <p>{t('how_to_donate_text')}</p>
        <Grid container spacing={2} direction={shouldImgCollapse ? 'column-reverse' : 'row'}>
          <Grid size={{ xs: 6 }}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <h2>{t('donate_through_jgive.com_title')}</h2>
              <a
                href="https://www.jgive.com/new/he/ils/donation-targets/3268"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  src="https://www.hasadna.org.il/wp-content/uploads/2017/12/%D7%AA%D7%A8%D7%95%D7%9E%D7%95%D7%AA.jpg"
                  alt={t('donation_link')}
                  width={'90%'}
                  style={{ maxWidth: '420px' }}
                />
              </a>
              <ButtonDonate
                href="https://www.jgive.com/new/he/ils/donation-targets/3268"
                target="_blank"
                rel="noreferrer">
                <ButtonDonateText>{t('donate')}</ButtonDonateText>
                <ButtonDonateIcon>
                  <ArrowBackIosNewRounded sx={{ fontSize: 32 }} />
                </ButtonDonateIcon>
              </ButtonDonate>
            </Typography>
          </Grid>
          <Grid dir={direction} size={{ xs: 6 }}>
            <h2>{t('donation_through_bank_title')}</h2>
            <p>{t('donation_through_bank_reccomendation')}</p>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {t('bank')}: {t('donation_through_bank_details_bank')}
              <br />
              {t('branch')}: {t('donation_through_bank_details_branch')}
              <br />
              {t('account')}: {t('donation_through_bank_details_account')}
              <br />
              {t('account_name')}: {t('donation_through_bank_details_account_name')}
            </Typography>
            <sub>{t('donation_through_bank_details_additional_message')}</sub>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default DonateModal
