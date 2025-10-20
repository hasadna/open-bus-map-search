import {
  ComplaintsSendPostRequest,
  SiriRideWithRelatedPydanticModel,
} from '@hasadna/open-bus-api-client'
import { Close } from '@mui/icons-material'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Collapse, Form, Select } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API, GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'
import { getSiriRideWithRelated } from 'src/api/siriService'
import dayjs from 'src/dayjs'
import type { Point } from 'src/pages/timeBasedMap'
import {
  allComplaintFields,
  complaintList,
  complaintTypeMappings,
  type ComplaintTypes,
  renderField,
} from './ComplaintModalConfig'

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
}

const useSiriRideQuery = (position: Point) => {
  const ride = useMemo(() => {
    return [
      position.point?.siri_route__id?.toString() ?? '',
      position.point?.siri_ride__vehicle_ref?.toString() ?? '',
      position.point?.siri_route__line_ref?.toString() ?? '',
    ] as [string, string, string]
  }, [position.point])
  return useQuery({ queryKey: ['ride', ...ride], queryFn: () => getSiriRideWithRelated(...ride) })
}

const useStationBus = (position: Point) => {
  const ride = useMemo(
    () => ({
      directions: position.point?.siri_route__id ?? -1,
      eventDate: position.recorded_at_time ?? -1,
      officelineId: position.point?.siri_route__line_ref ?? -1,
      operatorId: position?.operator ?? -1,
    }),
    [position.point],
  )

  return useQuery({
    queryKey: ['ride', ride],
    queryFn: () =>
      GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost({ govStationsByLinePostRequest: ride }),
  })
}

// const useTimeQueary = () => {
//   return useQuery({
//     queryKey: ['time'],
//     queryFn: () => GOVERNMENT_TRANSPORTATION_API.govTimeGet(),
//   })
// }

const useOpratorQueary = () => {
  return useQuery({
    queryKey: ['oprator'],
    queryFn: () => GOVERNMENT_TRANSPORTATION_API.govOperatorsGet(),
  })
}

// const formatValuesForSubmit = (values: Record<string, any>) => {
//   const res: Record<string, any> = { ...values }
//   Object.keys(res).forEach((k) => {
//     const v = res[k]
//     if (dayjs.isDayjs(v)) res[k] = v.format('HH:mm')
//   })
//   return res
// }

const getAutoDefaults = (name: string, siriData?: SiriRideWithRelatedPydanticModel) => {
  if (!siriData) return ''
  switch (name) {
    case 'operator':
      return siriData.gtfsRouteOperatorRef?.toString() ?? ''
    case 'trainNumber':
    case 'licensePlate':
      return siriData.vehicleRef ?? ''
    case 'lineNumber':
      return siriData.gtfsRouteRouteShortName ?? ''
    case 'route':
      return siriData.gtfsRouteLineRef?.toString() ?? ''
    default:
      return ''
  }
}

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)

  // const govTime = useTimeQueary()
  const siriRide = useSiriRideQuery(position)
  const stationBus = useStationBus(position)
  const oprator = useOpratorQueary()

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback(
    (values: Record<string, any>) => {
      // const payload = formatValuesForSubmit(values)
      console.log(values)

      // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
    },
    [submitMutation, siriRide.data],
  )

  const fillSelectOptions = (name: string) => {
    switch (name) {
      case 'operator':
        return oprator.data?.data?.map(({ dataText, dataCode }) => ({
          label: dataText,
          value: dataCode,
        }))
      case 'boardingStation':
        return stationBus.data?.data?.map(({ stationFullName, stationId }) => ({
          label: stationFullName,
          value: stationId,
        }))
      // case 'trainType':
      //   return []
      // case 'originStation':
      //   return []
      // case 'destinationStation':
      // return []
    }
  }

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null

    const mapping = complaintTypeMappings[selectedComplaintType]
    if (!mapping) return null

    const regular = mapping.fields.map((name) => {
      const field = allComplaintFields[name]
      field.props = {
        ...(field.props || {}),
        ...(field.component === 'Select' ? { options: fillSelectOptions(name) } : {}),
      }
      return renderField(field)
    })

    const auto = mapping.auto_fields.map((name) => {
      const field = allComplaintFields[name]
      if (!field) return null
      const value = getAutoDefaults(name, siriRide.data)

      field.props = {
        ...(field.props || {}),
        ...(['Checkbox', 'TimePicker', 'DatePicker'].includes(field.component) ? {} : { value }),
        ...(field.component === 'Select' ? { options: fillSelectOptions(name) } : {}),
        disabled: true,
      }

      return renderField(field, value)
    })

    return { regular, auto }
  }, [selectedComplaintType, siriRide.data])

  const isBusy =
    siriRide.isLoading ||
    submitMutation.isPending ||
    (submitMutation.isIdle === false && submitMutation.isPending)

  return (
    <>
      {isBusy ? (
        <div className="loading">
          <span>{t('loading_routes')}</span>
          <CircularProgress />
        </div>
      ) : (
        <Dialog
          dir={i18n.dir()}
          open={modalOpen}
          onClose={() => setModalOpen?.(false)}
          slotProps={{ paper: { sx: { maxWidth: '648px', width: '90%', position: 'relative' } } }}>
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
                <Typography variant="h2">{`Your Complaint Number: ${submitMutation.data.referenceNumber}`}</Typography>
                <Button onClick={() => setModalOpen?.(false)}>Close</Button>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={(changedValues) => {
                  if ('complaintType' in changedValues)
                    setSelectedComplaintType(changedValues.complaintType as ComplaintTypes)
                }}>
                {renderField(allComplaintFields.firstName)}
                {renderField(allComplaintFields.lastName)}
                {renderField(allComplaintFields.id)}
                {renderField(allComplaintFields.email)}
                {renderField(allComplaintFields.phone)}

                <Form.Item
                  name="complaintType"
                  label={t('complaint_type')}
                  rules={[{ required: true }]}>
                  <Select options={complaintList} />
                </Form.Item>

                {dynamicFields?.regular}

                {renderField(allComplaintFields.description)}

                <DialogActions sx={{ justifyContent: 'flex-end', padding: 0 }}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                      {t('submit_complaint')}
                    </Button>
                  </Form.Item>
                </DialogActions>

                <Collapse items={[{ label: 'more detelis', children: dynamicFields?.auto }]} />
              </Form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default ComplaintModal
