import { useState, ChangeEvent, useEffect } from 'react'
import {
  Button,
  MenuItem,
  TextField,
  CircularProgress,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
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

type complaintTypeStrings =
  | 'other'
  | 'no_stop'
  | 'no_ride'
  | 'delay'
  | 'overcrowded'
  | 'driver_behavior'
  | 'early'
  | 'cleanliness'
  | 'fine_appeal'
  | 'route_change'
  | 'line_switch'
  | 'station_signs'

type complaintType = {
  value: complaintTypeStrings
  label: complaintTypeStrings
}

const complaintTypes: complaintType[] = [
  { value: 'other', label: 'other' },
  { value: 'no_stop', label: 'no_stop' },
  { value: 'no_ride', label: 'no_ride' },
  { value: 'delay', label: 'delay' },
  { value: 'overcrowded', label: 'overcrowded' },
  { value: 'driver_behavior', label: 'driver_behavior' },
  { value: 'early', label: 'early' },
  { value: 'cleanliness', label: 'cleanliness' },
  { value: 'fine_appeal', label: 'fine_appeal' },
  { value: 'route_change', label: 'route_change' },
  { value: 'line_switch', label: 'line_switch' },
  { value: 'station_signs', label: 'station_signs' },
]

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

  const textDirection = i18n.language === 'he' ? 'rtl' : 'ltr'
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setComplaintData((prevData) => ({ ...prevData, [name]: value }))
  }

  // const handleSelectChange = (e: SelectChangeEvent<typeof complaintTypes>) => {
  const handleSelectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(e)
    setComplaintData((prevData) => ({ ...prevData, [name]: value }) as const)
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(`lalalala`)
    e.preventDefault()
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
        <Dialog
          dir={textDirection}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          PaperProps={{
            component: 'form',
            onSubmit: handleSubmit,
          }}>
          <DialogTitle>{t('complaint')}</DialogTitle>
          <DialogContent>
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
              type="email"
              value={complaintData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label={t('phone')}
              name="phone"
              type="tel"
              value={complaintData.phone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              id="complaint_type"
              select
              margin="normal"
              label={t('complaint_type')}
              fullWidth
              name="complaintType"
              value={complaintData.complaintType}
              onChange={handleSelectChange}>
              {complaintTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('description')}
              name="description"
              type="text"
              value={complaintData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
            <DialogActions sx={{ gap: '5px', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="warning" onClick={() => setModalOpen(false)}>
                {t('close_complaint')}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {t('submit_complaint')}
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ComplaintModal
