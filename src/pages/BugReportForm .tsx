import { CreateIssuePostRequest } from '@hasadna/open-bus-api-client'
import { Alert } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { Button, Form, FormProps, Input, Select } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ISSUES_API } from 'src/api/apiConfig'
import Widget from 'src/shared/Widget'
import InfoYoutubeModal from './components/YoutubeModal'
import './BugReportForm.scss'

// File upload is disabled until the server-side implementation is complete.
const BugReportForm = () => {
  const { t, i18n } = useTranslation()
  const [form] = Form.useForm<CreateIssuePostRequest>()
  // const [fileList, setFileList] = useState<UploadFile[]>([])

  const createIssueMutation = useMutation({
    mutationFn: (values: CreateIssuePostRequest) => {
      return ISSUES_API.issuesCreatePost({ createIssuePostRequest: values })
    },
    onSuccess: (response) => {
      if (response.data?.state === 'open') {
        form.resetFields()
        // setFileList([])
      }
    },
    onError: (error) => {
      console.error('Error submitting bug report:', error)
    },
  })

  const onFinish = (values: CreateIssuePostRequest) => {
    createIssueMutation.mutate(values)
  }

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  // const onFileChange = (info: UploadChangeParam) => {
  //   setFileList(info.fileList)
  // }

  const options = useMemo(() => {
    return [
      { value: 'always', label: i18n.t('bug_frequency.always') },
      { value: 'sometimes', label: i18n.t('bug_frequency.sometimes') },
      { value: 'rarely', label: i18n.t('bug_frequency.rarely') },
      { value: 'once', label: i18n.t('bug_frequency.once') },
    ]
  }, [i18n.language])

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
      <Form
        form={form}
        name="bug-report"
        onFinish={(values) => {
          onFinish(values)
        }}
        onFinishFailed={onFinishFailed}
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
          label={t('bug_environment')}
          name="environment"
          rules={[{ required: true, min: 1, max: 200 }]}>
          <Input />
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
          <Button type="primary" htmlType="submit" loading={createIssueMutation.isPending}>
            {t('bug_submit')}
          </Button>
        </Form.Item>
      </Form>

      {createIssueMutation.isSuccess && (
        <Alert severity="success" sx={{ marginTop: 2 }}>
          <a
            href={createIssueMutation.data.data?.htmlUrl}
            target="_blank"
            rel="noopener noreferrer">
            {t('reportBug.viewIssue')} (Github)
          </a>
          {', '}
          {t('reportBug.success')}
        </Alert>
      )}

      {createIssueMutation.isError && (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          {t('reportBug.error')}
        </Alert>
      )}
    </Widget>
  )
}

export default BugReportForm
