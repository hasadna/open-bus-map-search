import {
  ComplaintsSendPostRequest,
  // GtfsRoutePydanticModel,
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
import { Button, Form, Select } from 'antd'
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
  // route: GtfsRoutePydanticModel
}

const fieldSiriIndex = {
  operator: 'siriRouteOperatorRef',
  licensePlate: 'vehicleRef',
  // trainNumber: 'vehicleRef',
  lineNumber: 'gtfsRouteRouteShortName',
  route: 'siriRouteLineRef',
  eventDate: 'gtfsRouteDate',
} as Record<keyof typeof allComplaintFields, keyof SiriRideWithRelatedPydanticModel>

const ComplaintModal = ({
  modalOpen = false,
  setModalOpen,
  position,
  //route,
}: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const siriRide = useSiriRideQuery(position)

  const boardingQuery = useMemo(() => {
    if (!selectedRoute || !siriRide.data?.lines.length) return {}

    const selectedLine = siriRide.data.lines[selectedRoute]
    if (!selectedLine) return {}

    return {
      directions: selectedLine.directionCode ? Number(selectedLine.directionCode) : undefined,
      eventDate: selectedLine.eventDate ? dayjs(selectedLine.eventDate).valueOf() : undefined,
      officelineId: selectedLine.lineCode,
      operatorId: selectedLine.operatorId,
    }
  }, [selectedRoute, siriRide.data?.lines])

  const boardingStation = useBoardingStationQuery(boardingQuery)

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback(
    (values: Record<string, unknown>) => {
      // const payload = formatValuesForSubmit(values)
      console.log(values)

      // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
    },
    [submitMutation, siriRide.data],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null
    const mapping = complaintTypeMappings[selectedComplaintType]

    // Create a set of fields that should be disabled because they're provided by Siri data
    const siriDisabledFields = new Set<string>()
    if (siriRide.data) {
      mapping.allFields.forEach((name) => {
        const siriKey = fieldSiriIndex[name]
        if (siriKey && siriRide.data.siri[siriKey] !== undefined) {
          siriDisabledFields.add(name)
        }
      })
    }

    return mapping.allFields
      .map((name) => {
        const field = { ...allComplaintFields[name] }
        if (!field) return null

        // Initialize props if not present
        if (!field.props) field.props = {}

        // Handle fields with Siri data
        const isSiriDisabled = siriDisabledFields.has(name)
        if (isSiriDisabled) {
          const siriKey = fieldSiriIndex[name]
          const siriValue = siriKey ? siriRide.data?.siri[siriKey] : undefined
          field.initialValue = siriValue !== undefined ? siriValue.toString() : undefined
          // field.props.disabled = true
        }

        // Handle special Select fields
        if (field.type === 'Select') {
          switch (field.name) {
            case 'route':
              field.props.options = siriRide.data?.lines.map(({ directionText }) => ({
                label: directionText,
                value: directionText,
              }))

              // Set initial value for route field based on selected route
              if (selectedRoute !== null && siriRide.data?.lines[selectedRoute]?.directionText) {
                field.initialValue = siriRide.data.lines[selectedRoute].directionText
              }

              field.props.onSelect = (val) => {
                const routeIndex =
                  siriRide.data?.lines?.findIndex((r) => r.directionText === val) ?? -1
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
  }, [selectedComplaintType, siriRide.data, boardingStation.data, selectedRoute])

  const isBusy =
    siriRide.isLoading ||
    submitMutation.isPending ||
    (submitMutation.isIdle === false && submitMutation.isPending)

  useEffect(() => {
    // const name = siriRide.data?.siri.gtfsRouteRouteLongName
    //   ?.split(/[<->,-]/u)
    //   .filter((v) => v !== '')

    // const index = siriRide.data?.lines?.findIndex(({ originCity, destinationCity }) => {
    //   return name?.[1] === originCity?.dataText && name?.[3] === destinationCity?.dataText
    // })

    setSelectedRoute(null)
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

              // Requirement 1: If operator or lineNumber changes, reset selectedRoute to null to re-evaluate dependent fields (route/boardingStation)
              if ('operator' in changedValues || 'lineNumber' in changedValues) {
                setSelectedRoute(null)
              }
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

            {dynamicFields}

            {renderField(allComplaintFields.description)}

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
  )
}

export default ComplaintModal
