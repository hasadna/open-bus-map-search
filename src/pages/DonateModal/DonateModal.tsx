import { ArrowBackIosNewRounded, CloseRounded } from '@mui/icons-material'
import { Box, Button, Grid, Modal, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
  width: '80%',
  bgcolor: 'background.paper',
  outline: 'none',
  border: '1px solid #ccc',
  boxShadow: 24,
  borderRadius: '8px',
} as const

const ButtonDonate = styled.a`
  margin-top: 16px;
  outline: none;
  direction: rtl;
  display: inline-flex;
  align-items: stretch;
  color: white;
  flex-wrap: nowrap;
  text-decoration: none;
  font-weight: bold;
  width: 100%;
  max-width: 420px;
  border-radius: 1000px;
  overflow: hidden;
  transition: ease box-shadow 0.25s;
  box-shadow: transparent 0 0 0 0;
  &:focus {
    box-shadow: #1498e588 0 0 0 3px;
  }
`
const ButtonDonateText = styled.span`
  background-color: #16a9ff;
  padding: 8px 32px 8px 8px;
  text-align: center;
  font-size: 32px;
  width: 100%;
`

const ButtonDonateIcon = styled.span`
  padding: 16px;
  width: 32px;
  min-height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1498e5;
`

const DonateModal = ({ isVisible, onClose }: DonateModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal
      open={isVisible}
      onClose={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ color: 'text.primary' }}>
      <Box sx={boxStyle}>
        <Typography
          component="div"
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          padding={2}
          paddingBottom={0}>
          <h1 id="modal-modal-title" style={{ margin: 0 }}>
            {t('how_to_donate_title')}
          </h1>
          <Button
            color="inherit"
            sx={{ borderRadius: 1000, minWidth: 32, width: 32, height: 32, padding: '4px' }}
            onClick={onClose}>
            <CloseRounded sx={{ height: '100%', width: '100%' }} />
          </Button>
        </Typography>
        <Box padding={2} overflow="auto" maxHeight="calc(100vh - 210px)">
          <p style={{ margin: 0 }}>{t('how_to_donate_text')}</p>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="div" id="modal-modal-description">
                <h2>{t('donate_through_jgive.com_title')}</h2>
              </Typography>
              <a
                href="https://www.jgive.com/new/he/ils/donation-targets/3268"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', outline: 'none' }}>
                <img
                  src="https://www.hasadna.org.il/wp-content/uploads/2017/12/%D7%AA%D7%A8%D7%95%D7%9E%D7%95%D7%AA.jpg"
                  alt={t('donation_link')}
                  width="100%"
                  style={{ maxWidth: '420px', borderRadius: 8 }}
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
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="div">
                <h2>{t('donation_through_bank_title')}</h2>
              </Typography>
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
      </Box>
    </Modal>
  )
}

export default DonateModal
