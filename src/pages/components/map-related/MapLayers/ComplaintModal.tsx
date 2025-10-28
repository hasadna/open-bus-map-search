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
import { Button, Form } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from 'usehooks-ts'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import {
  useBoardingStationQuery,
  useBusOperatorQuery,
  useCitiesQuery,
  useLinesQuery,
} from 'src/hooks/useFormQuerys'
import { Point } from 'src/pages/timeBasedMap'
import {
  allComplaintFields,
  ComplainteField,
  createAllRules,
  RenderField,
} from './ComplaintModalFields'
import { type ComplaintType, complaintTypeMappings, complaintTypes } from './ComplaintModalForms'

interface User {
  firstName: string
  lastName: string
  id: string
  email: string
  phone: string
}

interface ComplaintFormValues extends User {
  complaintType: ComplaintType
  description: string
  busOperator?: string
  licensePlate?: string
  eventDate?: string
  lineNumber?: string
  eventTime?: string
  route?: number
  wait?: [string, string]
  boardingStation?: string
  cityFrom?: string
  cityTo?: string
  ticketDate?: string
  ticketTime?: string
  travelFrom?: string
  travelTo?: string
  activeDate?: string
  addRemoveStation?: string
  removeStation?: string
  requestedStationAddress?: string
  boardingAddress?: string
  addFrequencyOverCrowd?: boolean
  addFrequencyLongWait?: boolean
  addFrequencyExtendTime?: boolean
  willingToTestifyMot?: boolean
  willingToTestifyCourt?: boolean
  ravKavNumber?: string
  addRemoveStationReason?: string
  destinationLocality?: string
  addFrequencyReason?: string
}

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

const resetRouteKeys = new Set(['eventDate', 'operator', 'lineNumber'])
const userKeys = new Set(['firstName', 'lastName', 'id', 'email', 'phone'])

const ComplaintModal = ({
  modalOpen = false,
  setModalOpen,
  position,
  route,
}: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<ComplaintFormValues>()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintType | null>(null)
  const [userStorge, SetUserStorge] = useLocalStorage<Partial<User>>('complaint', {})

  const eventDate = Form.useWatch('eventDate', form)
  const busOperator = Form.useWatch('busOperator', form)
  const lineNumber = Form.useWatch('lineNumber', form)
  const selectedRoute = Form.useWatch('route', form)
  const addRemoveStation = Form.useWatch('addRemoveStation', form)

  const busOperatorQuery = useBusOperatorQuery()
  const citiesQuery = useCitiesQuery()
  const linesQuery = useLinesQuery(eventDate, busOperator, lineNumber)
  const boardingStationQuery = useBoardingStationQuery(
    selectedRoute !== undefined ? linesQuery.data?.[selectedRoute] : undefined,
  )

  const routeParts = useMemo(
    () => route.routeLongName?.split(/[<->,-]/u).filter((part) => part.trim() !== ''),
    [route],
  )
  useEffect(() => {
    if (route.routeShortName === form.getFieldValue('lineNumber') && linesQuery.data?.length) {
      const matchingIndex = linesQuery.data.findIndex(
        ({ originCity, destinationCity }) =>
          routeParts?.[1] === originCity?.dataText && routeParts?.[3] === destinationCity?.dataText,
      )
      if (matchingIndex !== -1) {
        form.setFieldValue('route', matchingIndex)
      }
    }
  }, [linesQuery.data, route, form])

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest }),
  })

  const handleSubmit = useCallback((values: ComplaintFormValues) => {
    console.log(values)
    // TODO: Implement actual submission logic
    // submitMutation.mutate({ debug: true, userData: payload, databusData: siriRide.data })
  }, [])

  const onValuesChange = useCallback(
    (changedValues: Partial<ComplaintFormValues>) => {
      if ('complaintType' in changedValues) {
        setSelectedComplaintType(changedValues.complaintType as ComplaintType)
      }

      if (Object.keys(changedValues).some((key) => resetRouteKeys.has(key))) {
        form.setFieldValue('route', undefined)
        form.setFieldValue('boardingStation', undefined)
      }

      if ('route' in changedValues) {
        form.setFieldValue('boardingStation', undefined)
      }

      if ('eventTime' in changedValues) {
        form.validateFields(['wait'])
      }

      if (Object.keys(changedValues).some((key) => userKeys.has(key))) {
        SetUserStorge({ ...userStorge, ...changedValues })
      }
    },
    [form, userStorge],
  )

  const routeOptions = useMemo(() => {
    return linesQuery.data?.map(({ directionText }, value) => ({
      label: directionText,
      value,
    }))
  }, [linesQuery.data])

  const boardingStationOptions = useMemo(() => {
    return boardingStationQuery.data?.map(({ stationFullName, stationId }) => ({
      label: stationFullName,
      value: stationId,
    }))
  }, [boardingStationQuery.data])

  const busOperatorOptions = useMemo(() => {
    return busOperatorQuery.data?.map(({ dataText, dataCode }) => ({
      label: dataText,
      value: dataCode,
    }))
  }, [busOperatorQuery.data])

  const citiesOptions = useMemo(() => {
    return citiesQuery.data?.map(({ dataText }) => ({
      label: dataText,
      value: dataText,
    }))
  }, [busOperatorQuery.data])

  const complaintOptins = useMemo(() => {
    return complaintTypes.map((value: ComplaintType) => ({ value, label: t(value) }))
  }, [t])

  const addRemoveStationOptins = useMemo(() => {
    return [
      { label: t('add_station'), value: 'add' },
      { label: t('remove_station'), value: 'remove' },
    ]
  }, [t])

  const { waitRules, idRules, ravKavRules, firstNameRules, lastNameRules } = useMemo(
    () => createAllRules(form, t),
    [form, t],
  )

  const handleSelectOptions = useCallback(
    (name: ComplainteField) => {
      switch (name) {
        case 'addRemoveStation':
          return addRemoveStationOptins
        case 'boardingStation':
          return boardingStationOptions
        case 'busOperator':
          return busOperatorOptions
        case 'cityFrom':
        case 'cityTo':
          return citiesOptions
        case 'route':
          return routeOptions
      }
    },
    [addRemoveStationOptins, busOperatorOptions, boardingStationOptions, routeOptions],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null

    return complaintTypeMappings[selectedComplaintType].fields
      .map((name) => {
        const field = { ...allComplaintFields[name] }
        if (field.type === 'Select' || field.type === 'Radio') {
          field.props = { ...field.props, options: handleSelectOptions(name) }
        }
        if (
          (name === 'requestedStationAddress' && addRemoveStation === 'remove') ||
          (name === 'boardingStation' && addRemoveStation === 'add')
        ) {
          field.props = { ...field.props, disabled: true }
        }

        if (name === 'wait') field.rules = waitRules
        if (name === 'ravKavNumber') field.rules = ravKavRules

        return <RenderField key={name} {...field} />
      })
      .filter(Boolean)
  }, [selectedComplaintType, handleSelectOptions, waitRules, ravKavRules, addRemoveStation, t])

  const date = useMemo(() => {
    return position.recorded_at_time ? dayjs(position.recorded_at_time) : undefined
  }, [position.recorded_at_time])

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
              ...userStorge,
              busOperator: position.operator,
              eventDate: date,
              eventTime: date,
              activeDate: date,
              cityFrom: routeParts?.[1],
              cityTo: routeParts?.[3],
              licensePlate: position.point?.siri_ride__vehicle_ref,
              lineNumber: route.routeShortName,
            } as Partial<ComplaintFormValues>
          }
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}>
          {submitMutation.isSuccess ? (
            <div>
              <Typography variant="h2">
                {t('complaint_number', { number: submitMutation.data.referenceNumber })}
              </Typography>
              <Button onClick={() => setModalOpen?.(false)}>{t('close')}</Button>
            </div>
          ) : busOperatorQuery.isLoading || submitMutation.isPending ? (
            <div className="loading">
              <span>{t('loading_routes')}</span>
              <CircularProgress />
            </div>
          ) : (
            <>
              <RenderField {...allComplaintFields.firstName} rules={firstNameRules} />
              <RenderField {...allComplaintFields.lastName} rules={lastNameRules} />
              <RenderField {...allComplaintFields.id} rules={idRules} />
              <RenderField {...allComplaintFields.email} />
              <RenderField {...allComplaintFields.phone} />
              <RenderField
                {...allComplaintFields.complaintType}
                props={{ options: complaintOptins }}
              />
              {dynamicFields}
              <RenderField {...allComplaintFields.description} />

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
