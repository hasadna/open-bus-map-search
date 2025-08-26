import { TimeField } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useState, ChangeEvent, useMemo } from 'react'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ComplaintsSendPostRequest,
  ComplaintsSendPostRequestUserData,
} from '@hasadna/open-bus-api-client'
import { Row } from '../../Row'
import { Point } from 'src/pages/timeBasedMap'
import { getSiriRideWithRelated } from 'src/api/siriService'
import { COMPLAINTS_API } from 'src/api/apiConfig'

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
  const [complaintData, setComplaintData] = useState<ComplaintsSendPostRequestUserData>({
    firstName: '',
    lastName: '',
    id: '',
    email: '',
    phone: '',
    complaintType: '',
    description: '',
  })
  const [times, setTimes] = useState({
    timeEvent: dayjs().startOf('day'),
    timeWaitFrom: dayjs().startOf('day'),
    timeWaitUntil: dayjs().startOf('day'),
  })

  const ride = useMemo(() => {
    return [
      position.point!.siri_route__id.toString(),
      position.point!.siri_ride__vehicle_ref.toString(),
      position.point!.siri_route__line_ref.toString(),
    ] as [siriRouteId: string, vehicleRefs: string, siriRouteLineRefs: string]
  }, [position.point])

  const siriRide = useQuery({
    queryKey: ['todos', ...ride],
    queryFn: () => getSiriRideWithRelated(...ride),
  })

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) => {
      return COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest })
    },
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setComplaintData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handelTimeChange = (name: string, value: dayjs.Dayjs | null) => {
    setTimes((prevData) => ({ ...prevData, [name]: value }) as const)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submitMutation.mutate({
      debug: true,
      userData: complaintData,
      databusData: {
        ...siriRide.data,
        timeEvent: times.timeEvent.format('HH:mm'),
        timeWaitFrom: times.timeWaitFrom.format('HH:mm'),
        timeWaitUntil: times.timeWaitUntil.format('HH:mm'),
      },
    })
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
      {siriRide.isLoading || submitMutation.isPending ? (
        <div className="loading">
          <span>{t('loading_routes')}</span>
          <CircularProgress />
        </div>
      ) : (
        <Dialog
          dir={i18n.dir()}
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
              required
              margin="normal"
            />
            <TextField
              label={t('last_name')}
              name="lastName"
              value={complaintData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label={t('id')}
              name="id"
              slotProps={{
                htmlInput: {
                  maxLength: 9,
                },
              }}
              value={complaintData.id}
              onChange={handleInputChange}
              error={!isVaildId}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label={t('email')}
              name="email"
              type="email"
              value={complaintData.email}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label={t('phone')}
              name="phone"
              type="tel"
              value={complaintData.phone}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              id="complaint_type"
              select
              required
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
                required
                margin="normal"
                label="event_time"
                fullWidth
                name="timeEvent"
                value={times.timeEvent}
                shouldDisableTime={(time) =>
                  time < times.timeWaitFrom || time > times.timeWaitUntil
                }
                onChange={(time) => handelTimeChange('timeEvent', time)}
              />
              <TimeField
                id="wait_from"
                required
                margin="normal"
                label="wait_from"
                shouldDisableTime={(time) => time > times.timeWaitUntil}
                fullWidth
                name="timeWaitFrom"
                value={times.timeWaitFrom}
                onChange={(time) => handelTimeChange('timeWaitFrom', time)}
              />
              <TimeField
                id="wait_until"
                required
                margin="normal"
                label="wait_until"
                shouldDisableTime={(time) => time < times.timeWaitFrom}
                fullWidth
                name="timeWaitUntil"
                value={times.timeWaitUntil}
                onChange={(time) => handelTimeChange('timeWaitUntil', time)}
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
              required
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
