import { ComplaintsSendPostRequest, GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
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
import { useMutation } from '@tanstack/react-query'
import { Button, Form, Select } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import {
  useBoardingStationQuery,
  useBusOperatorQuery,
  useLinesQuery,
} from 'src/hooks/useFormQuerys'
import { Point } from 'src/pages/timeBasedMap'
import { allComplaintFields, renderField } from './ComplaintModalFields'
import { complaintList, type ComplaintType, complaintTypeMappings } from './ComplaintModalForms'

interface ComplaintFormValues {
  firstName: string
  lastName: string
  id: string
  email: string
  phone: string
  description: string
  operator?: string
  licensePlate?: string
  eventDate?: string
  lineNumber?: string
  eventTime?: string
  route?: string
  wait?: [string, string]
  boardingStation?: string
  busDirectionFrom?: string
  busDirectionTo?: string
  lineActiveDate?: string
  addRemoveStationReason?: string
  requestedStationAddress?: string
  boardingLocality?: string
  destinationLocality?: string
  addFrequencyReason?: string
  willingToTestifyMOT?: boolean
  willingToTestifyCourt?: boolean
  ravKavNumber?: string
  complaintType: ComplaintType
}

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

const ComplaintModal = ({
  modalOpen = false,
  setModalOpen,
  position,
  route,
}: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<ComplaintFormValues>()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintType | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<number>()

  const eventDate = Form.useWatch('eventDate', form)
  const operator = Form.useWatch('operator', form)
  const lineNumber = Form.useWatch('lineNumber', form)

  const busOperator = useBusOperatorQuery()
  const useLines = useLinesQuery(eventDate, lineNumber, operator)
  const boardingStation = useBoardingStationQuery(
    selectedRoute && useLines.data ? useLines.data[selectedRoute] : undefined,
  )

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback((values: ComplaintFormValues) => {
    console.log(values)
    // TODO: Implement actual submission logic
    // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
  }, [])

  const routeOptions = useMemo(() => {
    return useLines.data?.map(({ directionText }) => ({
      label: directionText,
      value: directionText,
    }))
  }, [useLines.data])

  const boardingStationOptions = useMemo(() => {
    return boardingStation.data?.map(({ stationFullName, stationId }) => ({
      label: stationFullName,
      value: stationId,
    }))
  }, [boardingStation.data])

  const busOperatorOptions = useMemo(() => {
    return busOperator.data?.map(({ dataText, dataCode }) => ({
      label: dataText,
      value: dataCode,
    }))
  }, [busOperator.data])

  const handleRouteSelect = useCallback(
    (val: string) => {
      const routeIndex = useLines.data?.findIndex((r) => r.directionText === val) ?? -1
      setSelectedRoute(routeIndex >= 0 ? routeIndex : undefined)
    },
    [useLines.data],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null

    return complaintTypeMappings[selectedComplaintType]
      .map((name) => {
        const field = { ...allComplaintFields[name] }
        if (field.type === 'Select') {
          field.props = { ...field.props }
          switch (field.name) {
            case 'boardingStation':
              field.props.options = boardingStationOptions
              break
            case 'operator':
              field.props.options = busOperatorOptions
              break
            case 'route':
              field.props.options = routeOptions
              field.props.onSelect = handleRouteSelect
              break
          }
        }

        return renderField(field)
      })
      .filter((v) => v != null)
  }, [
    selectedComplaintType,
    busOperatorOptions,
    boardingStationOptions,
    routeOptions,
    handleRouteSelect,
  ])

  const isBusy = busOperator.isLoading || submitMutation.isPending

  const date = useMemo(
    () => (position.recorded_at_time ? dayjs(position.recorded_at_time) : undefined),
    [position.recorded_at_time],
  )

  // const onUpdate = (lines) => {
  //   const name = route.routeLongName?.split(/[<->,-]/u).filter((v) => v !== '')
  //   if (route.routeShortName !== form.getFieldValue('lineNumber') || lines.length === 0) return
  //   const index = lines?.findIndex(({ originCity, destinationCity }) => {
  //     return name?.[1] === originCity?.dataText && name?.[3] === destinationCity?.dataText
  //   })
  //   console.log(index)

  //   // setSelectedRoute(index || null)
  // }

  return (
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
        <Form
          form={form}
          layout="vertical"
          initialValues={
            {
              operator: position.operator,
              eventDate: date,
              eventTime: date,
              licensePlate: position.point?.siri_ride__vehicle_ref,
              lineNumber: route.routeShortName,
            } as Partial<ComplaintFormValues>
          }
          onFinish={handleSubmit}
          onValuesChange={(changedValues) => {
            if ('complaintType' in changedValues) {
              setSelectedComplaintType(changedValues.complaintType as ComplaintType)
            }
          }}>
          {submitMutation.isSuccess ? (
            <div>
              <Typography variant="h2">{`Your Complaint Number: ${submitMutation.data.referenceNumber}`}</Typography>
              <Button onClick={() => setModalOpen?.(false)}>Close</Button>
            </div>
          ) : isBusy ? (
            <div className="loading">
              <span>{t('loading_routes')}</span>
              <CircularProgress />
            </div>
          ) : (
            <>
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

              {dynamicFields}

              {renderField(allComplaintFields.description)}

              <DialogActions sx={{ justifyContent: 'flex-end', padding: 0 }}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                    {t('submit_complaint')}
                  </Button>
                </Form.Item>
              </DialogActions>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ComplaintModal
