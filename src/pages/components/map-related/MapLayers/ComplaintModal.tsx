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
  mobileOnly,
  RenderField,
} from './ComplaintModalFields'
import { type ComplaintType, complaintTypeMappings, complaintTypes } from './ComplaintModalForms'

interface User {
  firstName: string
  lastName: string
  iDNum: string
  email: string
  mobile: string
}

interface ComplaintFormValues extends User {
  complaintType: ComplaintType
  applyContent: string
  busOperator?: string
  licenseNum?: string
  eventDate?: string
  lineNumberText?: string
  eventTime?: string
  direction?: number
  wait?: [string, string]
  raisingStation?: string
  city?: string
  raisingStationCity?: string
  destinationStationCity?: string
  reportdate?: string
  reportTime?: string
  busDirectionFrom?: string
  busDirectionTo?: string
  addOrRemoveStation?: string
  raisingStationAddress?: string
  addFrequencyOverCrowd?: boolean
  addFrequencyLongWait?: boolean
  addFrequencyExtendTime?: boolean
  firstDeclaration?: boolean
  secondDeclaration?: boolean
  ravKavNumber?: string
  addFrequencyReason?: string
}

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

const resetRouteKeys = new Set(['eventDate', 'busOperator', 'lineNumberText'])
const userKeys = new Set(['firstName', 'lastName', 'iDNum', 'email', 'mobile'])

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
  const reportdate = Form.useWatch('reportdate', form)
  const busOperator = Form.useWatch('busOperator', form)
  const lineNumberText = Form.useWatch('lineNumberText', form)
  const selectedRoute = Form.useWatch('direction', form)
  const addOrRemoveStation = Form.useWatch('addOrRemoveStation', form)

  const busOperatorQuery = useBusOperatorQuery()
  const citiesQuery = useCitiesQuery()
  const linesQuery = useLinesQuery(eventDate || reportdate, busOperator, lineNumberText)
  const boardingStationQuery = useBoardingStationQuery(
    selectedRoute !== undefined ? linesQuery.data?.[selectedRoute] : undefined,
  )

  const routeParts = useMemo(
    () => route.routeLongName?.split(/[<->,-]/u).filter((part) => part.trim() !== ''),
    [route.routeLongName],
  )
  useEffect(() => {
    if (route.routeShortName === form.getFieldValue('lineNumberText') && linesQuery.data?.length) {
      const matchingIndex = linesQuery.data.findIndex(({ lineCode, directionCode }) => {
        return Number(route.routeMkt) === lineCode && Number(directionCode) === directionCode
      })

      if (matchingIndex !== -1) {
        form.setFieldValue('direction', matchingIndex)
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
        form.setFieldValue('direction', undefined)
        form.setFieldValue('raisingStation', undefined)
      }

      if ('direction' in changedValues) {
        form.setFieldValue('raisingStation', undefined)
      }

      if ('eventTime' in changedValues) {
        form.validateFields(['wait'])
      }

      if (Object.keys(changedValues).some((key) => userKeys.has(key))) {
        if (
          changedValues?.mobile &&
          mobileOnly.test(changedValues.mobile) &&
          changedValues.mobile.length === 10
        ) {
          changedValues.mobile = `${changedValues.mobile.slice(0, 3)}-${changedValues.mobile.slice(3)}`
          form.setFieldValue('mobile', changedValues.mobile)
        }
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

  const addOrRemoveStationOptins = useMemo(() => {
    return [
      { label: t('add_station'), value: '2' },
      { label: t('remove_station'), value: '1' },
    ]
  }, [t])

  const addingFrequencyReasonOptins = useMemo(() => {
    return [
      { label: t('add_frequency_load_topics'), value: 'LoadTopics' },
      { label: t('add_frequency_long_waiting'), value: 'LongWaiting' },
      { label: t('add_frequency_extension_time'), value: 'ExtensionHours' },
    ]
  }, [t])

  const allRules = useMemo(() => createAllRules(form, t), [form, t])

  const handleSelectOptions = useCallback(
    (name: ComplainteField) => {
      switch (name) {
        case 'addingFrequencyReason':
          return addingFrequencyReasonOptins
        case 'addOrRemoveStation':
          return addOrRemoveStationOptins
        case 'raisingStation':
          return boardingStationOptions
        case 'busOperator':
          return busOperatorOptions
        case 'city':
        case 'raisingStationCity':
        case 'destinationStationCity':
          return citiesOptions
        case 'direction':
          return routeOptions
      }
    },
    [
      addingFrequencyReasonOptins,
      addOrRemoveStationOptins,
      busOperatorOptions,
      boardingStationOptions,
      citiesOptions,
      routeOptions,
    ],
  )

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null
    const isAddStation = addOrRemoveStation === '2'
    return complaintTypeMappings[selectedComplaintType].fields
      .map((name) => {
        const field = { ...allComplaintFields[name] }

        if (['Select', 'Radio', 'CheckboxGroup'].includes(field.type)) {
          field.props = { ...field.props, options: handleSelectOptions(name) }
        }

        if (name === 'raisingStationAddress' && selectedComplaintType === 'station_signs') {
          field.rules = [{ required: true }]
        }

        if (selectedComplaintType === 'add_or_remove_station') {
          if (name === 'raisingStationAddress') {
            field.props = { ...field.props, disabled: !isAddStation }
            field.rules = [{ required: isAddStation }]
            if (!isAddStation) form.setFieldValue('raisingStationAddress', undefined)
          }

          if (name === 'raisingStation') {
            field.props = { ...field.props, disabled: isAddStation }
            field.rules = [{ required: !isAddStation }]
            if (isAddStation) form.setFieldValue('raisingStation', undefined)
          }
        }

        if (name === 'ravKavNumber' || name === 'wait') {
          field.rules = allRules[name]
        }

        return <RenderField key={name} {...field} />
      })
      .filter(Boolean)
  }, [selectedComplaintType, handleSelectOptions, allRules, addOrRemoveStation])

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
              addOrRemoveStation: '2',
              busOperator: position.operator,
              eventDate: date,
              reportdate: date,
              eventTime: date,
              reportTime: date,
              wait: [date?.add(-30, 'm'), date?.add(30, 'm')] as unknown as [string, string],
              raisingStationCity: routeParts?.[1],
              destinationStationCity: routeParts?.[3],
              licenseNum: position.point?.siri_ride__vehicle_ref,
              lineNumberText: route.routeShortName,
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
              <RenderField {...allComplaintFields.firstName} rules={allRules.firstName} />
              <RenderField {...allComplaintFields.lastName} rules={allRules.lastName} />
              <RenderField {...allComplaintFields.iDNum} rules={allRules.iDNum} />
              <RenderField {...allComplaintFields.email} />
              <RenderField {...allComplaintFields.mobile} rules={allRules.mobile} />
              <RenderField
                {...allComplaintFields.complaintType}
                props={{ options: complaintOptins }}
              />
              {dynamicFields}
              <RenderField
                {...allComplaintFields.applyContent}
                extra={
                  selectedComplaintType === 'line_switch' ? 'complaint_details_required' : undefined
                }
              />

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
