import {
  ComplaintsSendPostRequest,
  ComplaintsSendPostRequestUserData,
} from '@hasadna/open-bus-api-client'
import { Close } from '@mui/icons-material'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Form, Input, Select, TimePicker } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import { getSiriRideWithRelated } from 'src/api/siriService'
import dayjs from 'src/dayjs'
import { Point } from 'src/pages/timeBasedMap'

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

const complaintTypes: { value: complaintTypeStrings; label: complaintTypeStrings }[] = [
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
  if (id === undefined || id === '' || id.length !== 9) return true
  const num = Number(id)
  if (!num || isNaN(num) || num <= 0) return false
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    const n = Number(id[i]) * ((i % 2) + 1)
    sum += Math.floor(n / 10) + (n % 10)
  }
  return sum % 10 === 0
}

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [times, setTimes] = useState<Record<string, dayjs.Dayjs | null>>({
    timeEvent: null,
    waitFrom: null,
    waitTo: null,
  })

  const ride = useMemo(() => {
    return [
      position.point?.siri_route__id.toString(),
      position.point?.siri_ride__vehicle_ref.toString(),
      position.point?.siri_route__line_ref.toString(),
    ] as [siriRouteId: string, vehicleRefs: string, siriRouteLineRefs: string]
  }, [position.point])

  const siriRide = useQuery({
    queryKey: ['ride', ...ride],
    queryFn: () => getSiriRideWithRelated(...ride),
  })

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) => {
      return COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest })
    },
  })

  const handleSubmit = (values: ComplaintsSendPostRequestUserData) => {
    submitMutation.mutate({
      debug: true,
      userData: {
        ...values,
        timeEvent: times.timeEvent?.format('HH:mm'),
        waitFrom: times.waitFrom?.format('HH:mm'),
        waitTo: times.waitTo?.format('HH:mm'),
      },
      databusData: siriRide.data,
    })
  }

  return (
    <>
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
              sx: { maxWidth: '648px', width: '90%', position: 'relative' },
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
            {submitMutation.isSuccess ? (
              <div>
                <Typography variant="h2">
                  {`Your Complint Number: ${submitMutation.data.referenceNumber}`}
                </Typography>
                <Button onClick={() => setModalOpen?.(false)}>Close</Button>
              </div>
            ) : (
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="firstName"
                  label={t('first_name')}
                  rules={[{ required: true, pattern: /[א-ת]+/u }]}>
                  <Input maxLength={25} />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label={t('last_name')}
                  rules={[{ required: true, pattern: /[א-ת]+/u }]}>
                  <Input maxLength={25} />
                </Form.Item>

                <Form.Item
                  name="id"
                  label={t('id')}
                  rules={[
                    { required: true, len: 9 },
                    {
                      validator: (_, value) => {
                        return IDValidator(value as string)
                          ? Promise.resolve()
                          : Promise.reject(new Error('Invalid ID'))
                      },
                    },
                  ]}>
                  <Input maxLength={9} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={t('email')}
                  rules={[{ type: 'email', required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item name="phone" label={t('phone')} rules={[{ required: true }]}>
                  <Input maxLength={11} />
                </Form.Item>

                <Form.Item
                  name="complaintType"
                  label={t('complaint_type')}
                  rules={[{ required: true }]}>
                  <Select
                    options={complaintTypes.map((c) => ({ value: c.value, label: t(c.label) }))}
                  />
                </Form.Item>

                <Grid container spacing={{ md: 3, xs: 0 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Form.Item name="from" label={t('from')}>
                      <Input maxLength={90} />
                    </Form.Item>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Form.Item name="to" label={t('destination')}>
                      <Input maxLength={90} />
                    </Form.Item>
                  </Grid>
                </Grid>

                <Grid container spacing={{ md: 3, xs: 0 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Form.Item name="eventTime" label="Event Time" rules={[{ required: true }]}>
                      <TimePicker
                        style={{ width: '100%' }}
                        value={times.timeEvent}
                        onChange={(time) => setTimes((times) => ({ ...times, timeEvent: time }))}
                        format="HH:mm"
                      />
                    </Form.Item>
                  </Grid>

                  <Grid size={{ xs: 12, md: 8 }}>
                    <Form.Item name="wait" label="Wait" rules={[{ required: true }]}>
                      <TimePicker.RangePicker
                        style={{ width: '100%' }}
                        value={[times.waitFrom, times.waitTo]}
                        onChange={(changeTimes) =>
                          setTimes((times) => ({
                            ...times,
                            waitFrom: changeTimes?.[0] || null,
                            waitTo: changeTimes?.[1] || null,
                          }))
                        }
                        format="HH:mm"
                      />
                    </Form.Item>
                  </Grid>
                </Grid>

                <Form.Item
                  name="description"
                  label={t('description')}
                  rules={[{ required: true, min: 2 }]}>
                  <Input.TextArea rows={4} maxLength={1500} />
                </Form.Item>

                <DialogActions sx={{ justifyContent: 'flex-end', padding: 0 }}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                      {t('submit_complaint')}
                    </Button>
                  </Form.Item>
                </DialogActions>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default ComplaintModal
