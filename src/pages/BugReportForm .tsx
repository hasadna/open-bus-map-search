import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Upload, message, Select, FormProps, Card } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import './BugReportForm.scss'
import { UploadChangeParam, UploadFile } from 'antd/lib/upload'
const { Option } = Select

interface BugReportFormData {
  title: string
  description: string
  environment: string
  expectedBehavior: string
  actualBehavior: string
  reproducibility: string
  attachments: UploadFile[]
  contactName: string
  contactEmail: string
}

const BugReportForm = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  const [submittedUrl, setSubmittedUrl] = useState<string | undefined>(undefined)

  //Not implemented yet
  const onFinish = async (values: BugReportFormData) => {
    try {
      // Send the bug report data to the server
      // Include fileList in the values if needed

      const response = await axios.post(
        'https://open-bus-backend.k8s.hasadna.org.il/create-issue',
        {
          ...values,
          attachments: fileList,
        },
      )

      setSubmittedUrl(response.data.url)
      if (response.data.state === 'open') {
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

  return (
    <Card className="bug-report-form-container">
      <h1 className="logo">דאטאבוס</h1>

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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}>
        <Form.Item
          label={t('bug_type')}
          name="type"
          initialValue={selectedType}
          rules={[{ required: true, message: t('bug_type_message') }]}>
          <Select onChange={(value) => setSelectedType(value)}>
            <Option value="bug">{t('bug_type_bug')}</Option>
            <Option value="feature">{t('bug_type_feature')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t('bug_title')}
          name="title"
          rules={[{ required: true, message: t('bug_title_message') }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_contact_name')}
          name="contactName"
          rules={[{ required: true, message: t('bug_contact_name_message') }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_contact_email')}
          name="contactEmail"
          rules={[
            { required: true, message: t('bug_contact_email_message') },
            // { type: 'email', message: t(TEXT_KEYS.bug_contact_email_valid_message) },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_description')}
          name="description"
          rules={[{ required: true, message: t('bug_description_message') }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_environment')}
          name="environment"
          rules={[{ required: true, message: t('bug_environment_message') }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label={t('bug_expected_behavior')}
          name="expectedBehavior"
          rules={[{ required: true, message: t('bug_expected_behavior_message') }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_actual_behavior')}
          name="actualBehavior"
          rules={[{ required: true, message: t('bug_actual_behavior_message') }]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label={t('bug_reproducibility')}
          name="reproducibility"
          rules={[{ required: true, message: t('bug_reproducibility_message') }]}>
          <Input />
        </Form.Item>

        <Form.Item label={t('bug_attachments')} name="attachments">
          <Upload
            beforeUpload={() => false}
            listType="picture"
            fileList={fileList}
            onChange={onFileChange}>
            <Button icon={<UploadOutlined />}>{t('bug_attachments_upload_button')}</Button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            {t('bug_submit')}{' '}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default BugReportForm
