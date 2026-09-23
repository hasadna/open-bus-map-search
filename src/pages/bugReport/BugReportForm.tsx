import { CreateIssuePostRequest } from '@hasadna/open-bus-api-client'
import { CheckCircleTwoTone } from '@mui/icons-material'
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button as MuiButton,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { Button, Checkbox, Form, Input, Select } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { ISSUES_API } from 'src/api/apiConfig'
import { EasterEgg } from 'src/pages/components/EasterEgg/EasterEgg'
import { OutboundArrow } from 'src/pages/components/OutboundArrow'
import InfoYoutubeModal from 'src/pages/components/YoutubeModal'
import Widget from 'src/shared/Widget'
import './BugReportForm.scss'

const issuesUrl = 'https://github.com/hasadna/open-bus-map-search/issues'

// File upload is disabled until the server-side implementation is complete.
const BugReportForm = () => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<CreateIssuePostRequest>()
  // const [fileList, setFileList] = useState<UploadFile[]>([])

  const [searchParams] = useSearchParams()
  const [contextUrl] = useState(() => searchParams.get('context'))

  const mutation = useMutation({
    mutationFn: (values: CreateIssuePostRequest) =>
      ISSUES_API.issuesCreatePost({ createIssuePostRequest: values }),
    onSuccess: () => {
      form.resetFields()
    },
    onError: (error) => {
      console.error('Error submitting bug report:', error)
    },
  })

  const issueNumber = mutation.data?.data?.number
  const issueUrl = issueNumber ? `${issuesUrl}/${issueNumber}` : undefined

  const onFinish = (values: CreateIssuePostRequest) => {
    mutation.reset()
    mutation.mutate({
      ...values,
      ...(contextUrl ? { debugContext: contextUrl } : {}),
    })
  }

  // const onFileChange = (info: UploadChangeParam) => {
  //   setFileList(info.fileList)
  // }

  const options = useMemo(() => {
    return [
      { value: 'always', label: t('bug_frequency.always') },
      { value: 'sometimes', label: t('bug_frequency.sometimes') },
      { value: 'rarely', label: t('bug_frequency.rarely') },
      { value: 'once', label: t('bug_frequency.once') },
    ]
  }, [t])

  return (
    <Widget
      className="bug-report-form-container"
      title={
        <p className="logo">
          {t('website_name')}
          <InfoYoutubeModal
            label={t('open_video_about_this_page')}
            title={t('youtube_modal_info_title')}
            videoUrl="https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11"
          />
        </p>
      }>
      <span>{t('reportBug.description')}</span>
      <Dialog
        dir={i18n.dir()}
        open={mutation.isSuccess}
        onClose={mutation.reset}
        slotProps={{ paper: { sx: { borderRadius: '12px', maxWidth: '380px', width: '100%' } } }}>
        <DialogContent sx={{ textAlign: 'center', paddingBottom: 1 }}>
          <CheckCircleTwoTone color="success" sx={{ fontSize: 40 }} />
          <DialogTitle component="h2" sx={{ fontWeight: 700, padding: 0 }}>
            {t('reportBug.success')}
          </DialogTitle>
          {issueNumber && (
            <Typography
              dir="ltr"
              variant="h5"
              sx={{
                marginTop: 2,
                marginInline: 'auto',
                paddingBlock: 1,
                paddingInline: 3,
                maxWidth: 'fit-content',
                fontWeight: 700,
                letterSpacing: '0.05em',
                borderRadius: '8px',
                border: 1,
                borderColor: 'divider',
                backgroundColor: 'action.hover',
              }}>
              {`#${issueNumber}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: 'column',
            gap: 1,
            padding: 3,
            paddingTop: 1,
            '& > *': { margin: 0 },
          }}>
          {issueUrl && (
            <MuiButton
              fullWidth
              variant="contained"
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              // MUI uppercases button labels, which would spell the issue tracker "GITHUB"
              sx={{ textTransform: 'none' }}>
              {t('reportBug.viewIssue')}
              <OutboundArrow />
            </MuiButton>
          )}
          <MuiButton fullWidth onClick={mutation.reset} sx={{ textTransform: 'none' }}>
            {t('reportBug.close')}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {mutation.isError && (
        <Alert severity="error" onClose={mutation.reset} sx={{ marginBottom: 2 }}>
          {t('reportBug.error')}
        </Alert>
      )}

      <Form
        form={form}
        name="bug-report"
        onFinish={(values) => {
          onFinish(values)
        }}
        // onFinishFailed={onFinishFailed}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}>
        <Form.Item label={t('bug_type')} name="type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="bug">{t('bug_type_bug')}</Select.Option>
            <Select.Option value="feature">{t('bug_type_feature')}</Select.Option>
            <Select.Option value="other">{t('bug_type_other')}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t('bug_title')}
          name="title"
          rules={[{ required: true, min: 5, max: 200 }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_contact_name')}
          name="contactName"
          rules={[{ required: true, min: 1, max: 100 }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_contact_email')}
          name="contactEmail"
          rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_description')}
          name="description"
          rules={[{ required: true, min: 10, max: 5000 }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_expected_behavior')}
          name="expectedBehavior"
          rules={[{ required: true, min: 5, max: 1000 }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_actual_behavior')}
          name="actualBehavior"
          rules={[{ required: true, min: 5, max: 1000 }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_reproducibility')}
          name="reproducibility"
          rules={[{ required: true, min: 1, max: 100 }]}>
          <Select>
            {options.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t('bug_environment')}
          name="environment"
          initialValue={navigator.userAgent}
          extra={t('bug_environment_notice')}
          rules={[{ required: true, min: 1, max: 200 }]}>
          <Input />
        </Form.Item>

        {contextUrl && (
          <Form.Item label={t('bug_debug_context')}>
            <Input value={contextUrl} disabled />
          </Form.Item>
        )}

        <EasterEgg code="debug" autohide={false} onShow={() => form.setFieldValue('debug', true)}>
          {/* eslint-disable-next-line i18next/no-literal-string -- hidden developer toggle */}
          <Form.Item label="debug" name="debug" valuePropName="checked">
            <Checkbox />
          </Form.Item>
        </EasterEgg>

        {/* <Form.Item label={t('bug_attachments')} name="attachments">
          <Upload
            multiple
            maxCount={10}
            beforeUpload={() => false}
            listType="picture"
            fileList={fileList}
            onChange={onFileChange}>
            <Button icon={<FileUploadOutlined fontSize="small" />}>
              {t('bug_attachments_upload_button')}
            </Button>
          </Upload>
        </Form.Item> */}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} dir={i18n.dir()}>
            {t('bug_submit')}
          </Button>
        </Form.Item>
      </Form>
    </Widget>
  )
}

export default BugReportForm
