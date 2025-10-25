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
import { useMutation } from '@tanstack/react-query'
import { Button, Collapse, Form, Select } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { useBoardingStationQuery, useSiriRideQuery } from 'src/hooks/useFormQuerys'
import { Point } from 'src/pages/timeBasedMap'
import { allComplaintFields, renderField } from './ComplaintModalFields'
import { complaintList, complaintTypeMappings, type ComplaintTypes } from './ComplaintModalForms'

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
}

const fieldSiriIndex = {
  operator: 'siriRouteOperatorRef',
  licensePlate: 'vehicleRef',
  // trainNumber: 'vehicleRef',
  lineNumber: 'gtfsRouteRouteShortName',
  route: 'siriRouteLineRef',
  eventDate: 'gtfsRouteDate',
} as Record<keyof typeof allComplaintFields, keyof SiriRideWithRelatedPydanticModel>

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const siriRide = useSiriRideQuery(position)

  const boardingQueary = useMemo(
    () =>
      selectedRoute && siriRide.data?.lines.length
        ? {
            directions: siriRide.data.lines[selectedRoute]?.directionCode
              ? Number(siriRide.data.lines[selectedRoute]?.directionCode)
              : undefined,
            eventDate: siriRide.data.lines[selectedRoute]?.eventDate
              ? dayjs(siriRide.data.lines[selectedRoute]?.eventDate).valueOf()
              : undefined,
            officelineId: siriRide.data.lines[selectedRoute]?.lineCode,
            operatorId: siriRide.data.lines[selectedRoute]?.operatorId,
          }
        : {},
    [selectedRoute, siriRide.data?.lines],
  )

  const boardingStation = useBoardingStationQuery(boardingQueary)

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback(
    (values: any) => {
      // const payload = formatValuesForSubmit(values)
      console.log(values)

      // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
    },
    [submitMutation, siriRide.data],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null
    const mapping = complaintTypeMappings[selectedComplaintType]

    const regular = mapping.fields.map((name) => {
      const field = allComplaintFields[name]
      if (!field) return null
      if (!field.props) field.props = {}

      if (field.type === 'Select') {
        switch (field.name) {
          case 'route':
            field.props.options = siriRide.data?.lines.map(({ directionText }) => ({
              label: directionText,
              value: directionText,
            }))

            // if (selectedRoute && siriRide.data?.lines[selectedRoute]) {
            //   field.props.value = siriRide.data.lines[selectedRoute].directionText
            // }
            field.props.onSelect = (val) => {
              setSelectedRoute(
                siriRide.data?.lines?.findIndex((r) => r.directionText === val) || null,
              )
            }
            break
          case 'boardingStation':
            field.props.options = boardingStation.data
            break
        }
      }

      return renderField(field)
    })

    const auto = mapping.auto_fields
      .map((name) => {
        const field = allComplaintFields[name]
        if (!field) return null
        if (!field.props) field.props = {}
        field.props.disabled = true

        if (!siriRide.data) return renderField(field)

        const siriKey = fieldSiriIndex[name]
        const value = siriKey ? siriRide.data.siri[siriKey]?.toString() : undefined
        console.log(siriRide.data.siri)
        field.initialValue = typeof value === 'number' ? value : value
        if (field.name === '') {
        }
        if (field.type === 'Select') {
          switch (field.name) {
            case 'route':
              field.props.options = siriRide.data?.lines.map(({ directionText }) => ({
                label: directionText,
                value: directionText,
              }))
              break
            case 'boardingStation':
              field.props.options = boardingStation.data
              break
          }
        }
        return renderField(field)
      })
      .filter((v) => v != null)

    return { regular, auto }
  }, [selectedComplaintType, siriRide.dataUpdatedAt, boardingStation.dataUpdatedAt])

  const isBusy =
    siriRide.isLoading ||
    submitMutation.isPending ||
    (submitMutation.isIdle === false && submitMutation.isPending)

  useEffect(() => {
    const name = siriRide.data?.siri.gtfsRouteRouteLongName
      ?.split(/[<->,-]/u)
      .filter((v) => v !== '')

    const index = siriRide.data?.lines?.findIndex(({ originCity, destinationCity }) => {
      return name?.[1] === originCity?.dataText && name?.[3] === destinationCity?.dataText
    })

    setSelectedRoute(index || null)
  }, [siriRide.dataUpdatedAt])

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

            {(dynamicFields?.auto ?? []).length !== 0 && (
              <Collapse items={[{ label: 'more detelis', children: dynamicFields?.auto }]} />
            )}
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ComplaintModal
