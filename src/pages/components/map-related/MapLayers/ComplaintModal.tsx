import { useState, ChangeEvent, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client'
import { Point } from 'src/pages/timeBasedMap'
import { getSiriRideWithRelated } from 'src/api/siriService'

interface ComplaintModalProps {
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  position: Point
}

const ComplaintModal = ({ modalOpen, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [siriRide, setSiriRide] = useState<SiriRideWithRelatedPydanticModel | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [complaintData, setComplaintData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    email: '',
    phone: '',
    complaintType: '',
    description: '',
  })

  useEffect(() => {
    setIsLoading(true)
    getSiriRideWithRelated(
      position.point!.siri_route__id.toString(),
      position.point!.siri_ride__vehicle_ref.toString(),
      position.point!.siri_route__line_ref.toString(),
    )
      .then((siriRideRes: SiriRideWithRelatedPydanticModel) => setSiriRide(siriRideRes))
      .finally(() => setIsLoading(false))
  }, [position])

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: i18n.language === 'he' ? 'left' : 'right',
  } as const

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setComplaintData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setComplaintData((prevData) => ({ ...prevData, [name]: value }) as const)
  }
  const handleSubmit = () => {
    const complaintPayload = {
      userData: complaintData,
      databusData: {
        operator: siriRide?.gtfsRideGtfsRouteId,
        ...position,
      },
    }
    console.log(complaintPayload)
    // Handle the form submission, e.g., send it to an API
    setModalOpen(false)
  }

  return (
    <div>
      {isLoading || !siriRide ? (
        <div className="loading">
          <span>{t('loading_routes')}</span>
          <CircularProgress />
        </div>
      ) : (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <Box className="modal" sx={modalStyle}>
            <h2>{t('complaint')}</h2>
            <form>
              <TextField
                label={t('first_name')}
                name="firstName"
                value={complaintData.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('last_name')}
                name="lastName"
                value={complaintData.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('id')}
                name="id"
                value={complaintData.id}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('email')}
                name="email"
                value={complaintData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('phone')}
                name="phone"
                value={complaintData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('complaint_type')}</InputLabel>
                <Select
                  name="complaintType"
                  value={complaintData.complaintType}
                  onChange={handleSelectChange}
                  sx={{ textAlign: i18n.language === 'he' ? 'left' : 'right' }}>
                  <MenuItem value="other">{t('other')}</MenuItem>
                  <MenuItem value="no_stop">{t('no_stop')}</MenuItem>
                  <MenuItem value="no_ride">{t('no_ride')}</MenuItem>
                  <MenuItem value="delay">{t('delay')}</MenuItem>
                  <MenuItem value="overcrowded">{t('overcrowded')}</MenuItem>
                  <MenuItem value="driver_behavior">{t('driver_behavior')}</MenuItem>
                  <MenuItem value="early">{t('early')}</MenuItem>
                  <MenuItem value="cleanliness">{t('cleanliness')}</MenuItem>
                  <MenuItem value="fine_appeal">{t('fine_appeal')}</MenuItem>
                  <MenuItem value="route_change">{t('route_change')}</MenuItem>
                  <MenuItem value="line_switch">{t('line_switch')}</MenuItem>
                  <MenuItem value="station_signs">{t('station_signs')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={t('description')}
                name="description"
                value={complaintData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                style={{ marginTop: '16px', borderRadius: '50px' }}>
                {t('submit_complaint')}
              </Button>
            </form>
            <Button
              variant="contained"
              color="success"
              onClick={() => setModalOpen(false)}
              style={{ marginTop: '16px', borderRadius: '50px' }}>
              {t('close_complaint')}
            </Button>
          </Box>
        </Modal>
      )}
    </div>
  )
}

export default ComplaintModal
