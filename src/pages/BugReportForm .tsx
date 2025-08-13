import { CreateIssuePostRequest } from '@hasadna/open-bus-api-client'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Upload, UploadFile, message, Select, FormProps } from 'antd'
import { FileUploadOutlined } from '@mui/icons-material'
import './BugReportForm.scss'
import { UploadChangeParam } from 'antd/es/upload'
import InfoYoutubeModal from './components/YoutubeModal'
import { ISSUES_API } from 'src/api/apiConfig'
import Widget from 'src/shared/Widget'

const BugReportForm = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm<CreateIssuePostRequest>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submittedUrl, setSubmittedUrl] = useState<string | undefined>(undefined)

  //Not implemented yet
  const onFinish = async (values: CreateIssuePostRequest) => {
    try {
      // Send the bug report data to the server
      // Include fileList in the values if needed
      const response = await ISSUES_API.issuesCreatePost({
        createIssuePostRequest: {
          ...values,
          attachments: fileList.map((a) => JSON.stringify(a)),
        },
      })

      // @ts-expect-error: <need fix schema server>
      setSubmittedUrl(response?.data?.url as string)
      if (response.data?.state === 'open') {
        message.success(t('reportBug.success'))
        form.resetFields()
        setFileList([])
      } else {
        message.error(t('reportBug.error'))
      }
    } catch (error) {
      console.error('Error submitting bug report:', error)
      message.error(t('reportBug.error'))
    }
  }

  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const onFileChange = (info: UploadChangeParam) => {
    setFileList(info.fileList)
  }

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
      <span> {t('reportBug.description')}</span>
      <p>
        {submittedUrl && (
          <a href={submittedUrl} target="_blank" rel="noopener noreferrer">
            {t('reportBug.viewIssue')} (Github)
          </a>
        )}
      </p>
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

        <Form.Item label={t('bug_attachments')} name="attachments">
          <Upload
            beforeUpload={() => false}
            listType="picture"
            fileList={fileList}
            onChange={onFileChange}>
            <Button icon={<FileUploadOutlined fontSize="small" />}>
              {t('bug_attachments_upload_button')}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('bug_submit')}
          </Button>
        </Form.Item>
      </Form>
    </Widget>
  )
}

export default BugReportForm
