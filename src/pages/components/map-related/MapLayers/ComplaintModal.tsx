import { TimeField } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useState, ChangeEvent, useEffect, useMemo } from 'react'
import {
  Button,
  MenuItem,
  TextField,
  CircularProgress,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  // MobileStepper,
  IconButton,
  Typography,
} from '@mui/material'
import {
  Close,
  //  KeyboardArrowLeft, KeyboardArrowRight
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { SiriRideWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { Row } from '../../Row'
import { Point } from 'src/pages/timeBasedMap'
import { getSiriRideWithRelated } from 'src/api/siriService'

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
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

function IDValidator(id?: string) {
  if (id === undefined || id === '') return true
  if (!id || !Number(id) || id.length !== 9 || isNaN(Number(id))) return false
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    const incNum = Number(id[i]) * ((i % 2) + 1)
    sum += incNum > 9 ? incNum - 9 : incNum
  }
  return sum % 10 === 0
}

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
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
    eventTime: dayjs().startOf('day'),
    waitFrom: dayjs().startOf('day'),
    waitUntil: dayjs().startOf('day'),
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

  const handelTimeChange = (name: string, value: dayjs.Dayjs | null) => {
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
    setModalOpen?.(false)
  }

  // const [activeStep, setActiveStep] = useState(0)

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1)
  // }

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1)
  // }

  const isVaildId = useMemo(() => IDValidator(complaintData.id), [complaintData.id])

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
          onClose={() => setModalOpen?.(false)}
          slotProps={{
            paper: {
              component: 'form',
              onSubmit: handleSubmit,
            },
          }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontSize="28px" fontWeight="bold" marginBottom="8px">
              {t('complaint')}
            </Typography>
            <IconButton onClick={() => setModalOpen?.(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
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
              error={!isVaildId}
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
              onChange={handleInputChange}>
              {complaintTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>

            <Row>
              <TimeField
                id="event_time"
                margin="normal"
                label="event_time"
                fullWidth
                name="eventTime"
                value={complaintData.eventTime}
                shouldDisableTime={(time) =>
                  time < complaintData.waitFrom || time > complaintData.waitUntil
                }
                onChange={(time) => handelTimeChange('eventTime', time)}
              />
              <TimeField
                id="wait_from"
                margin="normal"
                label="wait_from"
                shouldDisableTime={(time) => time > complaintData.waitUntil}
                fullWidth
                name="waitFrom"
                value={complaintData.waitFrom}
                onChange={(time) => handelTimeChange('waitFrom', time)}
              />
              <TimeField
                id="wait_until"
                margin="normal"
                label="wait_until"
                shouldDisableTime={(time) => time < complaintData.waitFrom}
                fullWidth
                name="waitUntil"
                value={complaintData.waitUntil}
                onChange={(time) => handelTimeChange('waitUntil', time)}
              />
            </Row>

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
              <Button type="submit" variant="contained" color="primary">
                {t('submit_complaint')}
              </Button>
            </DialogActions>

            {/* <MobileStepper
              variant="dots"
              steps={6}
              position="static"
              activeStep={activeStep}
              sx={{ flexGrow: 1 }}
              nextButton={
                activeStep === 5 ? (
                  <Button>Send</Button>
                ) : (
                  <Button size="small" onClick={handleNext} disabled={activeStep === 5}>
                    Next
                    {textDirection === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                  </Button>
                )
              }
              backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                  {textDirection === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                  Back
                </Button>
              }
            /> */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ComplaintModal
