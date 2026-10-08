import { CloseTwoTone } from '@mui/icons-material'
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
import { Button, Checkbox, Form } from 'antd'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard, useLocalStorage } from 'usehooks-ts'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import {
  useBoardingStationQuery,
  useBusOperatorQuery,
  useLinesQuery,
} from 'src/hooks/useFormQuerys'
import { EasterEgg } from '../../EasterEgg/EasterEgg'
import { Row } from '../../Row'
import { allComplaintFields, createAllRules, mobileOnly, RenderField } from './ComplaintModalFields'
import { complaintTypeMappings } from './ComplaintModalForms'
import {
  ComplaintField,
  ComplaintFormValues,
  ComplaintModalProps,
  complaintTypes,
  ComplaintUser,
} from './ComplaintModalTypes'
import { buildComplaintData } from './ComplaintModalUtils'
import type { ComplaintSubmissionData } from './ComplaintModalUtils'

const USER_KEYS = new Set([
  'documentType',
  'id_fild',
  'passport_fild',
  'firstName',
  'lastName',
  'email',
  'mobile',
  'emailConfirmation',
  'ravKavNumber',
] as ComplaintField[])

const ComplaintModal = ({
  modalOpen = false,
  setModalOpen,
  position,
  route,
}: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<ComplaintFormValues>()
  const [userStorage, setUserStorage] = useLocalStorage<Partial<ComplaintUser>>('complaint', {})
  const [, copy] = useCopyToClipboard()
  const pairKey = useRef('')
  const eventDate = Form.useWatch('eventDate', form)
  const busOperator = Form.useWatch('busOperator', form)
  const lineNumberText = Form.useWatch('lineNumberText', form)
  const selectedRouteIndex = Form.useWatch('direction', form)
  const complaintType = Form.useWatch('complaintType', form)
  const documentType = Form.useWatch('documentType', form)

  const busOperatorQuery = useBusOperatorQuery(eventDate)
  const linesQuery = useLinesQuery(eventDate, busOperator, lineNumberText)
  const selectedRoute =
    selectedRouteIndex !== undefined ? linesQuery.data?.[selectedRouteIndex] : undefined
  const stationQuery = useBoardingStationQuery(selectedRoute)

  useEffect(() => {
    if (modalOpen) pairKey.current = crypto.randomUUID()
  }, [modalOpen])

  const submitMutation = useMutation({
    mutationFn: ({
      pairKey,
      ...post
    }: {
      debug: boolean
      data: ComplaintSubmissionData
      pairKey: string
    }) =>
      COMPLAINTS_API.complaintsSendPost(
        { complaintsSendPostRequest: post },
        {
          headers: {
            'Content-Type': 'application/json',
            'pair-key': pairKey,
          },
        },
      ),
  })

  const routeOptions = useMemo(
    () =>
      linesQuery.data?.map((item, index) => ({
        label: `${item.routeLongName || ''}${item.routeDirection ? ` (${item.routeDirection})` : ''}`,
        value: index,
      })),
    [linesQuery.data],
  )
  const stationOptions = useMemo(
    () =>
      stationQuery.data?.map((stop, index) => ({
        label: stop.gtfsStopName || String(stop.gtfsStopCode || ''),
        value: index,
      })),
    [stationQuery.data],
  )
  const busOperatorOptions = useMemo(
    () =>
      busOperatorQuery.data?.map(({ agencyName, operatorRef }) => ({
        label: agencyName,
        value: operatorRef,
      })),
    [busOperatorQuery.data],
  )

  const allRules = useMemo(() => createAllRules(form, t), [form, t])
  const handleSelectOptions = useCallback(
    (name: ComplaintField) => {
      if (name === 'busOperator') return busOperatorOptions
      if (name === 'direction') return routeOptions
      if (name === 'raisingStation') return stationOptions
      return undefined
    },
    [busOperatorOptions, routeOptions, stationOptions],
  )

  const dynamicFields = useMemo(() => {
    if (!complaintType) return null
    return complaintTypeMappings[complaintType].fields.map((name) => {
      const field = { ...allComplaintFields[name] }
      if (field.type === 'Select')
        field.props = { ...field.props, options: handleSelectOptions(name) }
      if (name === 'wait') field.rules = allRules.wait
      return <RenderField key={name} {...field} />
    })
  }, [complaintType, handleSelectOptions, allRules])

  const complaintOptions = useMemo(
    () => complaintTypes.map((type) => ({ value: type, label: t(`complaints.${type}`) })),
    [t],
  )

  const handleSubmit = useCallback(
    (values: ComplaintFormValues) => {
      submitMutation.mutate({
        pairKey: pairKey.current,
        debug: !!values.debug,
        data: buildComplaintData(values, {
          agencies: busOperatorQuery.data,
          routes: linesQuery.data,
          stops: stationQuery.data,
        }),
      })
    },
    [busOperatorQuery.data, linesQuery.data, stationQuery.data, submitMutation],
  )

  const onValuesChange = useCallback(
    (changedValues: Partial<ComplaintFormValues>) => {
      if (
        'eventDate' in changedValues ||
        'busOperator' in changedValues ||
        'lineNumberText' in changedValues
      ) {
        form.setFieldsValue({ direction: undefined, raisingStation: undefined })
      } else if ('direction' in changedValues) {
        form.setFieldValue('raisingStation', undefined)
      }
      if ('eventHour' in changedValues) void form.validateFields(['wait'])
      if ('documentType' in changedValues) {
        form.setFieldsValue({ id_fild: undefined, passport_fild: undefined })
        changedValues.id_fild = undefined
        changedValues.passport_fild = undefined
      }
      if ('email' in changedValues) {
        void form.validateFields(['emailConfirmation']).catch(() => undefined)
      }
      if (Object.keys(changedValues).some((key) => USER_KEYS.has(key as ComplaintField))) {
        if (
          changedValues.mobile &&
          mobileOnly.test(changedValues.mobile) &&
          changedValues.mobile.length === 10
        ) {
          changedValues.mobile = `${changedValues.mobile.slice(0, 3)}-${changedValues.mobile.slice(3)}`
          form.setFieldValue('mobile', changedValues.mobile)
        }
        const userValues = Object.fromEntries(
          Object.entries({ ...userStorage, ...changedValues }).filter(([key]) =>
            USER_KEYS.has(key as ComplaintField),
          ),
        ) as Partial<ComplaintUser>
        setUserStorage(userValues)
      }
    },
    [form, userStorage, setUserStorage],
  )

  const date = useMemo(
    () => (position.point?.recordedAtTime ? dayjs(position.point.recordedAtTime) : undefined),
    [position.point?.recordedAtTime],
  )

  useEffect(() => {
    const matchingIndex = linesQuery.data?.findIndex(
      (candidate) =>
        candidate.lineRef === Number(route.lineRef) &&
        candidate.routeMkt === route.routeMkt &&
        candidate.routeDirection === route.routeDirection,
    )
    if (
      matchingIndex !== undefined &&
      matchingIndex >= 0 &&
      form.getFieldValue('direction') === undefined
    ) {
      form.setFieldValue('direction', matchingIndex)
    }
  }, [linesQuery.data, route, form])

  return (
    <Dialog
      dir={i18n.dir()}
      open={modalOpen}
      onClose={() => setModalOpen?.(false)}
      slotProps={{ paper: { sx: { maxWidth: '648px', width: '90%', position: 'relative' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          {t('complaints.complaint')}
        </Typography>
        <IconButton onClick={() => setModalOpen?.(false)}>
          <CloseTwoTone />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            documentType: 'id',
            id_fild: '',
            passport_fild: '',
            ...userStorage,
            busOperator: position.operator,
            eventDate: date,
            eventHour: date,
            wait: date ? [date.add(-30, 'm'), date.add(30, 'm')] : undefined,
            licenseNumber: position.point?.siriRideVehicleRef,
            lineNumberText: route.routeShortName,
          }}
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}>
          {submitMutation.isSuccess ? (
            <div>
              <Typography
                variant="h5"
                sx={{
                  mx: 'auto',
                  borderRadius: '12px',
                  border: '1px solid rgba(128, 128, 128, 0.5)',
                  p: 3,
                  maxWidth: 'fit-content',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => void copy(submitMutation.data?.referenceNumber || '')}>
                {t('complaints.complaint_number')}
                <br />
                <strong>{submitMutation.data?.referenceNumber}</strong>
              </Typography>
              <Row style={{ justifyContent: 'space-between' }}>
                <Button type="primary" onClick={() => setModalOpen?.(false)}>
                  {t('complaints.close')}
                </Button>
                <Button
                  onClick={() => {
                    pairKey.current = crypto.randomUUID()
                    submitMutation.reset()
                    form.resetFields()
                  }}>
                  {t('complaints.new_complaint')}
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
              {(submitMutation.isError ||
                busOperatorQuery.isError ||
                linesQuery.isError ||
                stationQuery.isError) && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                  {t('reportBug.error')}
                </Alert>
              )}
              <RenderField
                {...allComplaintFields.documentType}
                props={{
                  options: [
                    { value: 'id', label: t('complaints.id') },
                    { value: 'passport', label: t('complaints.passport') },
                  ],
                }}
              />
              {documentType === 'id' && (
                <RenderField {...allComplaintFields.id} rules={allRules.id} />
              )}
              {documentType === 'passport' && (
                <RenderField {...allComplaintFields.passport} rules={allRules.passport} />
              )}
              <RenderField {...allComplaintFields.firstName} rules={allRules.firstName} />
              <RenderField {...allComplaintFields.lastName} rules={allRules.lastName} />
              <RenderField {...allComplaintFields.mobile} rules={allRules.mobile} />
              <RenderField
                {...allComplaintFields.email}
                rules={[{ required: true }, { type: 'email' }]}
              />
              <RenderField
                {...allComplaintFields.emailConfirmation}
                rules={[
                  { required: true },
                  { type: 'email' },
                  {
                    // eslint-disable-next-line @typescript-eslint/require-await
                    validator: async (_, value) => {
                      if (value && value !== form.getFieldValue('email'))
                        throw new Error(t('complaints.email_mismatch'))
                    },
                  },
                ]}
              />
              <RenderField {...allComplaintFields.ravKavNumber} rules={allRules.ravKavNumber} />
              <RenderField
                {...allComplaintFields.complaintType}
                props={{ options: complaintOptions }}
              />
              {dynamicFields}
              {complaintType && <RenderField {...allComplaintFields.details} />}
              <EasterEgg
                code="debug"
                autohide={false}
                onShow={() => form.setFieldValue('debug', true)}>
                <Form.Item name="debug" valuePropName="checked">
                  <Checkbox>{t('complaints.debug')}</Checkbox>
                </Form.Item>
              </EasterEgg>
              <DialogActions sx={{ justifyContent: 'flex-end', padding: 0 }}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {t('complaints.submit_complaint')}
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
