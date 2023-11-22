import React from 'react'
import { TEXT_KEYS } from 'src/resources/texts'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import './BugReportForm.scss'

interface BugReportFormProps {
  onSubmit: (values: BugReportFormData) => void
}

interface BugReportFormData {
  title: string
  description: string
  environment: string
  expectedBehavior: string
  actualBehavior: string
  reproducibility: string
  attachments: any[] // Adjust the type based on your requirements
  contactName: string
  contactEmail: string
}

const BugReportForm: React.FC<BugReportFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const onFinish = async (values: BugReportFormData) => {
    try {
      onSubmit(values)
      message.success('Bug report submitted successfully!')
      form.resetFields()
    } catch (error) {
      console.error('Error submitting bug report:', error)
      message.error('Error submitting bug report. Please try again.')
    }
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="bug-report-form-container">
      <h1 className="logo">דאטאבוס</h1>

      <Form
        form={form}
        name="bug-report"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}>
        <Form.Item
          label={t(TEXT_KEYS.bug_title)}
          name="title"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_title_message) }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_contact_name)}
          name="contactName"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_contact_name_message) }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_contact_email)}
          name="contactEmail"
          rules={[
            { required: true, message: t(TEXT_KEYS.bug_contact_email_message) },
            // { type: 'email', message: t(TEXT_KEYS.bug_contact_email_valid_message) },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_description)}
          name="description"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_description_message) }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_environment)}
          name="environment"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_environment_message) }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_expected_behavior)}
          name="expectedBehavior"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_expected_behavior_message) }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_actual_behavior)}
          name="actualBehavior"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_actual_behavior_message) }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t(TEXT_KEYS.bug_reproducibility)}
          name="reproducibility"
          rules={[{ required: true, message: t(TEXT_KEYS.bug_reproducibility_message) }]}>
          <Input />
        </Form.Item>

        <Form.Item label={t(TEXT_KEYS.bug_attachments)} name="attachments">
          <Upload beforeUpload={() => false} listType="picture">
            <Button icon={<UploadOutlined />}>{t(TEXT_KEYS.bug_attachments_upload_button)}</Button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            {t(TEXT_KEYS.bug_submit)}{' '}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default BugReportForm
