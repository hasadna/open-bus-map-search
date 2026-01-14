import { ComplaintFormSchemaAnyOf, GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { Close } from '@mui/icons-material'
import {
  Alert,
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
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard, useLocalStorage } from 'usehooks-ts'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import {
  useBoardingStationQuery,
  useBusOperatorQuery,
  // useCitiesQuery,
  useLinesQuery,
} from 'src/hooks/useFormQuerys'
import { Point } from 'src/pages/timeBasedMap'
import { EasterEgg } from '../../../EasterEgg/EasterEgg'
import { Row } from '../../Row'
import {
  allComplaintFields,
  buildComplaintTitle,
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

interface ComplaintData {
  complaintType: ComplaintType
  applyContent: string
  busOperator?: number
  licenseNum?: string
  eventDate?: dayjs.Dayjs
  lineNumberText?: string
  eventHour?: dayjs.Dayjs
  direction?: number
  wait?: [dayjs.Dayjs, dayjs.Dayjs]
  raisingStation?: number
  // raisingStationCity?: string
  // destinationStationCity?: string
  // reportdate?: dayjs.Dayjs
  // reportTime?: dayjs.Dayjs
  busDirectionFrom?: string
  busDirectionTo?: string
  // addOrRemoveStation?: '1' | '2'
  // raisingStationAddress?: string
  // firstDeclaration?: boolean
  // secondDeclaration?: boolean
  // ravKavNumber?: string
  // addingFrequencyReason?: ('LoadTopics' | 'LongWaiting' | 'ExtensionHours')[]
  debug?: boolean
}

type ComplaintFormValues = User & ComplaintData

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
  const [userStorge, SetUserStorge] = useLocalStorage<Partial<User>>('complaint', {})
  const [, copy] = useCopyToClipboard()

  const eventDate = Form.useWatch('eventDate', form)
  // const reportdate = Form.useWatch('reportdate', form)
  const busOperator = Form.useWatch('busOperator', form)
  const lineNumberText = Form.useWatch('lineNumberText', form)
  const selectedRoute = Form.useWatch('direction', form)
  const addOrRemoveStation = Form.useWatch('addOrRemoveStation', form)
  const complaintType = Form.useWatch('complaintType', form)

  const busOperatorQuery = useBusOperatorQuery()
  // const citiesQuery = useCitiesQuery()
  const linesQuery = useLinesQuery(eventDate, busOperator, lineNumberText) // || reportdate
  const stationQuery = useBoardingStationQuery(
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
    mutationFn: (post: { debug: boolean; data: ComplaintFormSchemaAnyOf }) =>
      COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest: post }),
  })

  const buildComplaintData = useCallback(
    ({
      complaintType,
      wait,
      busOperator,
      eventDate,
      // reportdate,
      // destinationStationCity,
      // raisingStationCity,
      direction,
      raisingStation,
      applyContent,
      // addingFrequencyReason,
      // addOrRemoveStation,
      busDirectionFrom,
      busDirectionTo,
      eventHour,
      licenseNum,
      lineNumberText,
      // raisingStationAddress,
      // ravKavNumber,
      // reportTime,
      // firstDeclaration,
      // secondDeclaration,
    }: ComplaintData): ComplaintFormSchemaAnyOf => {
      const selectOperator = busOperatorQuery.data?.find((b) => b.dataCode === busOperator)
      const selectedDirection = direction !== undefined ? linesQuery.data?.[direction] : undefined
      const selectedStation =
        raisingStation !== undefined ? stationQuery.data?.[raisingStation] : undefined
      // const selectedRaisingCity = raisingStationCity
      //   ? citiesQuery.data?.find((c) => c.dataText === raisingStationCity)
      //   : undefined
      // const selectedDestCity = destinationStationCity
      //   ? citiesQuery.data?.find((c) => c.dataText === destinationStationCity)
      //   : undefined

      const title = buildComplaintTitle({
        complaintType,
        eventDate,
        eventHour,
        // reportdate,
        // reportTime,
        lineNumberText,
        licenseNum,
      })

      return {
        personalDetails: userStorge,
        requestSubject: complaintTypeMappings[complaintType].subject,
        title,
        busAndOther: {
          applyContent,
          // raisingStationAddress,
          // ravKavNumber,
          // addingFrequencyReason,
          // addOrRemoveStation,
          busDirectionFrom,
          busDirectionTo,
          fillByMakatOrAddress: '2',
          // ravKav: ravKavNumber ? true : undefined,
          licenseNum,
          lineNumberText,
          eventHour: eventHour ? eventHour.format('HH:mm') : undefined,
          fromHour: wait?.[0] ? wait[0].format('HH:mm') : undefined,
          toHour: wait?.[1] ? wait[1].format('HH:mm') : undefined,
          eventDate: eventDate ? eventDate.toDate() : undefined,
          // reportdate: reportdate ? reportdate.toDate() : undefined,
          // reportTime: reportTime ? reportTime.format('HH:mm') : undefined,
          // firstDeclaration,
          // secondDeclaration,
          operator: selectOperator
            ? {
                dataText: selectOperator.dataText,
                dataCode: selectOperator.dataCode,
              }
            : undefined,
          direction: selectedDirection
            ? {
                dataText: selectedDirection.directionText!,
                dataCode: selectedDirection.directionCode!,
              }
            : undefined,
          raisingStation: selectedStation
            ? {
                dataText: selectedStation.stationName!,
                dataCode: selectedStation.stationId!,
              }
            : undefined,
          // raisingStationCity: selectedRaisingCity
          //   ? {
          //       dataText: selectedRaisingCity.dataText,
          //       dataCode: selectedRaisingCity.dataCode,
          //     }
          //   : undefined,
          // destinationStationCity: selectedDestCity
          //   ? {
          //       dataText: selectedDestCity.dataText,
          //       dataCode: selectedDestCity.dataCode,
          //     }
          //   : undefined,
        },
      }
    },
    [userStorge, busOperatorQuery.data, linesQuery.data, stationQuery.data], // citiesQuery.data,
  )

  const handleSubmit = useCallback(
    (complaintData: ComplaintData) => {
      const data = buildComplaintData(complaintData)
      submitMutation.mutate({ debug: !!complaintData.debug, data })
    },
    [buildComplaintData, submitMutation],
  )

  const onValuesChange = useCallback(
    (changedValues: Partial<ComplaintFormValues>) => {
      if (Object.keys(changedValues).some((key) => resetRouteKeys.has(key))) {
        form.setFieldValue('direction', undefined)
        form.setFieldValue('raisingStation', undefined)
      }

      if ('direction' in changedValues) {
        form.setFieldValue('raisingStation', undefined)
      }

      if ('eventHour' in changedValues) {
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
    return linesQuery.data?.map(({ directionText }, index) => ({
      label: directionText,
      value: index,
    }))
  }, [linesQuery.data])

  const stationOptions = useMemo(() => {
    return stationQuery.data?.map(({ stationName }, index) => ({
      label: stationName,
      value: index,
    }))
  }, [stationQuery.data])

  const busOperatorOptions = useMemo(() => {
    return busOperatorQuery.data?.map(({ dataText, dataCode }) => ({
      label: dataText,
      value: dataCode,
    }))
  }, [busOperatorQuery.data])

  // const citiesOptions = useMemo(() => {
  //   return citiesQuery.data?.map(({ dataText }) => ({
  //     label: dataText,
  //     value: dataText,
  //   }))
  // }, [citiesQuery.data])

  const complaintOptins = useMemo(() => {
    return complaintTypes.map((value: ComplaintType) => ({ value, label: t(value) }))
  }, [t])

  // const addOrRemoveStationOptins = useMemo(() => {
  //   return [
  //     { label: t('add_station'), value: '2' },
  //     { label: t('remove_station'), value: '1' },
  //   ]
  // }, [t])

  // const addingFrequencyReasonOptins = useMemo(() => {
  //   return [
  //     { label: t('add_frequency_load_topics'), value: 'LoadTopics' },
  //     { label: t('add_frequency_long_waiting'), value: 'LongWaiting' },
  //     { label: t('add_frequency_extension_time'), value: 'ExtensionHours' },
  //   ]
  // }, [t])

  const allRules = useMemo(() => createAllRules(form, t), [form, t])

  const handleSelectOptions = useCallback(
    (name: ComplainteField) => {
      switch (name) {
        // case 'addingFrequencyReason':
        //   return addingFrequencyReasonOptins
        // case 'addOrRemoveStation':
        //   return addOrRemoveStationOptins
        case 'raisingStation':
          return stationOptions
        case 'busOperator':
          return busOperatorOptions
        // case 'raisingStationCity':
        // case 'destinationStationCity':
        //   return citiesOptions
        case 'direction':
          return routeOptions
      }
    },
    [
      // addingFrequencyReasonOptins,
      // addOrRemoveStationOptins,
      busOperatorOptions,
      stationOptions,
      // citiesOptions,
      routeOptions,
    ],
  )

  const dynamicFields = useMemo(() => {
    if (!complaintType) return null
    // const isAddStation = addOrRemoveStation === '2'
    return complaintTypeMappings[complaintType].fields
      .map((name) => {
        const field = { ...allComplaintFields[name] }

        if (['Select', 'Radio', 'CheckboxGroup'].includes(field.type)) {
          field.props = { ...field.props, options: handleSelectOptions(name) }
        }

        // if (name === 'raisingStationAddress' && complaintType === 'station_signs') {
        //   field.rules = [{ required: true }]
        // }

        // if (complaintType === 'add_or_remove_station') {
        //   if (name === 'raisingStationAddress') {
        //     field.props = { ...field.props, disabled: !isAddStation }
        //     field.rules = [{ required: isAddStation }]
        //     if (!isAddStation) form.setFieldValue('raisingStationAddress', undefined)
        //   }

        //   if (name === 'raisingStation') {
        //     field.props = { ...field.props, disabled: isAddStation }
        //     field.rules = [{ required: !isAddStation }]
        //     if (isAddStation) form.setFieldValue('raisingStation', undefined)
        //   }
        // }

        // if (name === 'ravKavNumber' || name === 'wait') {
        //   field.rules = allRules[name]
        // }

        return <RenderField key={name} {...field} />
      })
      .filter(Boolean)
  }, [complaintType, handleSelectOptions, allRules, addOrRemoveStation])

  console.log(position)
  const date = useMemo(() => {
    return position.point?.recordedAtTime ? dayjs(position.point?.recordedAtTime) : undefined
  }, [position.point?.recordedAtTime])

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
              // reportdate: date,
              eventHour: date,
              // reportTime: date,
              wait: [date?.add(-30, 'm'), date?.add(30, 'm')],
              raisingStationCity: routeParts?.[1],
              destinationStationCity: routeParts?.[3],
              licenseNum: position.point?.siriRideVehicleRef,
              lineNumberText: route.routeShortName,
            } as Partial<ComplaintFormValues>
          }
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}>
          {submitMutation.isSuccess ? (
            <div>
              <Typography
                variant="h5"
                sx={{
                  mx: 'auto',
                  borderRadius: `12px`,
                  border: '1px solid rgba(128, 128, 128, 0.5)',
                  p: 3,
                  maxWidth: 'fit-content',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  copy(submitMutation?.data?.referenceNumber || '')
                }}>
                {t('complaint_number')}
                <br />
                <strong>{submitMutation?.data?.referenceNumber}</strong>
              </Typography>
              <Row style={{ justifyContent: 'space-between' }}>
                <Button type="primary" onClick={() => setModalOpen?.(false)}>
                  {t('close')}
                </Button>
                <Button
                  onClick={() => {
                    submitMutation.reset()
                    form.resetFields()
                  }}>
                  {t('new_complaint')}
                </Button>
              </Row>
            </div>
          ) : busOperatorQuery.isLoading || submitMutation.isPending ? (
            <div className="loading">
              <span>{t('loading_routes')}</span>
              <CircularProgress />
            </div>
          ) : (
            <>
              {submitMutation.isError && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                  {t('reportBug.error')}
                </Alert>
              )}

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
              {complaintType && (
                <RenderField
                  {...allComplaintFields.applyContent}
                  // extra={complaintType === 'line_switch' ? 'complaint_details_required' : undefined}
                />
              )}
              <EasterEgg
                code="debug"
                autohide={false}
                onShow={() => form.setFieldValue('debug', true)}>
                <RenderField {...allComplaintFields.debug} />
              </EasterEgg>

              <DialogActions sx={{ justifyContent: 'flex-end', padding: 0 }}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
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
