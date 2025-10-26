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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { useBoardingStationQuery, useLinesQuery } from 'src/hooks/useFormQuerys'
import { Point } from 'src/pages/timeBasedMap'
import { allComplaintFields, renderField } from './ComplaintModalFields'
import { complaintList, complaintTypeMappings, type ComplaintTypes } from './ComplaintModalForms'

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
  complaintType: ComplaintTypes
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
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)

  const eventDate = Form.useWatch('eventDate', form)
  const operator = Form.useWatch('operator', form)
  const lineNumber = Form.useWatch('lineNumber', form)

  const useLines = useLinesQuery({
    eventDate: eventDate ? dayjs(eventDate).valueOf() : undefined,
    operatorId: operator ? Number(operator) : undefined,
    operatorLineId: lineNumber ? Number(lineNumber) : undefined,
  })

  const boardingQuery = useMemo(() => {
    if (!selectedRoute || !useLines.data?.length) return {}
    const selectedLine = useLines.data[selectedRoute]
    if (!selectedLine) return {}

    return {
      directions: selectedLine.directionCode ? Number(selectedLine.directionCode) : undefined,
      eventDate: selectedLine.eventDate ? dayjs(selectedLine.eventDate).valueOf() : undefined,
      officelineId: selectedLine.lineCode,
      operatorId: selectedLine.operatorId,
    }
  }, [selectedRoute, useLines.data])

  const boardingStation = useBoardingStationQuery(boardingQuery)

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback(
    (values: ComplaintFormValues) => {
      // const payload = formatValuesForSubmit(values)
      console.log(values)
      // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
    },
    [submitMutation],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null
    const mapping = complaintTypeMappings[selectedComplaintType]

    return mapping.allFields
      .map((name) => {
        const field = { ...allComplaintFields[name] }
        if (!field) return null
        if (!field.props) field.props = {}

        if (field.type === 'Select') {
          switch (field.name) {
            case 'route':
              field.props.options = useLines.data?.map(({ directionText }) => ({
                label: directionText,
                value: directionText,
              }))

              if (selectedRoute !== null && useLines.data?.[selectedRoute]?.directionText) {
                field.initialValue = useLines.data?.[selectedRoute].directionText
              }

              field.props.onSelect = (val) => {
                const routeIndex = useLines.data?.findIndex((r) => r.directionText === val) ?? -1
                setSelectedRoute(routeIndex >= 0 ? routeIndex : null)
              }
              break

            case 'boardingStation':
              field.props.options = boardingStation.data || []
              break
          }
        }

        return renderField(field)
      })
      .filter((v) => v != null)
  }, [selectedComplaintType, useLines.data, boardingStation.data, selectedRoute])

  const isBusy =
    useLines.isLoading ||
    submitMutation.isPending ||
    (submitMutation.isIdle === false && submitMutation.isPending)

  useEffect(() => {
    //   const name = route.routeLongName?.split(/[<->,-]/u).filter((v) => v !== '')
    //   console.log(route.routeShortName !== form.getFieldValue('lineNumber'))
    //   if (route.routeShortName !== form.getFieldValue('lineNumber')) return
    //   const index = useLines.data?.findIndex(({ originCity, destinationCity }) => {
    //     return name?.[1] === originCity?.dataText && name?.[3] === destinationCity?.dataText
    //   })
    //   setSelectedRoute(index || null)
  }, [route.routeLongName, useLines.data, route.routeShortName])

  const date = useMemo(
    () => (position.recorded_at_time ? dayjs(position.recorded_at_time) : undefined),
    [position.recorded_at_time],
  )

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
              eventDate: date?.format('YYYY-MM-DD'),
              eventTime: date?.format('HH-mm'),
              licensePlate: position.point?.siri_ride__vehicle_ref,
              lineNumber: route.routeShortName,
            } as Partial<ComplaintFormValues>
          }
          onFinish={handleSubmit}
          onValuesChange={(changedValues) => {
            if ('complaintType' in changedValues) {
              setSelectedComplaintType(changedValues.complaintType as ComplaintTypes)
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
