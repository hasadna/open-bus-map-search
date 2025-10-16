import {
  ComplaintsSendPostRequest,
  // ComplaintsSendPostRequestUserData,
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
import { Button, Form, Select } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPLAINTS_API } from 'src/api/apiConfig'
import { getSiriRideWithRelated } from 'src/api/siriService'
import dayjs from 'src/dayjs'
import { Point } from 'src/pages/timeBasedMap'
import {
  allComplaintFields,
  complaintList,
  complaintTypeMappings,
  type ComplaintTypes,
  type FormFieldSetting,
  renderField,
} from './ComplaintModalConfig'

interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
}

const ComplaintModal = ({ modalOpen = false, setModalOpen, position }: ComplaintModalProps) => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm()
  const [selectedComplaintType, setSelectedComplaintType] = useState<ComplaintTypes | null>(null)

  const ride = useMemo(() => {
    return [
      position.point?.siri_route__id.toString(),
      position.point?.siri_ride__vehicle_ref.toString(),
      position.point?.siri_route__line_ref.toString(),
    ] as [siriRouteId: string, vehicleRefs: string, siriRouteLineRefs: string]
  }, [position.point])

  const siriRide = useQuery({
    queryKey: ['ride', ...ride],
    queryFn: () => getSiriRideWithRelated(...ride),
  })

  const submitMutation = useMutation({
    mutationFn: (complaintsSendPostRequest: ComplaintsSendPostRequest) => {
      return COMPLAINTS_API.complaintsSendPost({ complaintsSendPostRequest })
    },
  })

  const handleSubmit = (values: Record<string, any>) => {
    const formattedValues = { ...values }
    for (const key in formattedValues) {
      if (dayjs.isDayjs(formattedValues[key])) {
        formattedValues[key] = formattedValues[key].format('HH:mm')
      }
    }
    console.log(formattedValues)
    //submitMutation.mutate({ debug: true, userData: formattedValues, databusData: siriRide.data })
  }

  const dynamicFields = useMemo(() => {
    if (!selectedComplaintType) return null
    const mapping = complaintTypeMappings[selectedComplaintType]
    if (!mapping) return null

    const regularFields = mapping.fields.map((fieldName) => {
      const fieldConfig = allComplaintFields[fieldName] as FormFieldSetting
      return fieldConfig ? renderField(fieldConfig) : null
    })

    const autoFields = mapping.auto_fields.map((fieldName) => {
      const fieldConfig = allComplaintFields[fieldName] as FormFieldSetting
      if (!fieldConfig) return null
      // Auto Fill
      let defaultValue = ''
      if (siriRide.isSuccess && fieldConfig) {
        switch (fieldConfig.name) {
          case 'trainNumber':
          case 'licensePlate':
            defaultValue = siriRide.data?.vehicleRef || ''
            break
          case 'lineNumber':
            defaultValue = siriRide.data?.gtfsRouteRouteShortName || ''
            break
          case 'route':
            defaultValue = siriRide.data?.gtfsRouteLineRef?.toString() || ''
            break
          default:
            defaultValue = ''
        }
      }

      if (fieldConfig.props) {
        fieldConfig.props.disabled = true
      } else {
        fieldConfig.props = { disabled: true }
      }

      return renderField(fieldConfig, defaultValue)
    })

    return [...regularFields, ...autoFields]
  }, [selectedComplaintType, t, siriRide.data?.id])

  return (
    <>
      {siriRide.isLoading || submitMutation.isPending ? (
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
                  if ('complaintType' in changedValues) {
                    setSelectedComplaintType(changedValues.complaintType as ComplaintTypes)
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
      )}
    </>
  )
}

export default ComplaintModal
