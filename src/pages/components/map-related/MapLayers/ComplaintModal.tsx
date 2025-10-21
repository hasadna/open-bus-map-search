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
import { allComplaintFields, renderField } from './ComplaintModalFields'
import { complaintList, complaintTypeMappings, type ComplaintTypes } from './ComplaintModalForms'

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

const fieldSiriIndex = {
  operator: 'gtfsRouteOperatorRef',
  licensePlate: 'vehicleRef',
  // trainNumber: 'vehicleRef',
  lineNumber: 'gtfsRouteRouteShortName',
  route: 'gtfsRouteLineRef',
  eventDate: 'gtfsRouteDate',
} as Record<keyof typeof allComplaintFields, keyof SiriRideWithRelatedPydanticModel>

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)

  const siriRide = useSiriRideQuery(position)

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
    if (!mapping) return null

    const regular = mapping.fields.map((name) => renderField(allComplaintFields[name]))

    const auto = mapping.auto_fields
      .map((name) => {
        const field = allComplaintFields[name]
        if (!field) return null

        if (!field.props) field.props = {}
        field.props.disabled = true

        const siriIndex = fieldSiriIndex[name]
        const value = siriRide.data && siriIndex ? siriRide.data[siriIndex] : undefined

        field.initialValue = typeof value === 'number' ? value.toString() : value

        return renderField(field)
      })
      .filter((v) => v != null)

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

                {(dynamicFields?.auto ?? []).length !== 0 && (
                  <Collapse items={[{ label: 'more detelis', children: dynamicFields?.auto }]} />
                )}
              </Form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default ComplaintModal
