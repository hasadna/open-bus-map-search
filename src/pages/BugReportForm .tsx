import React, { useState } from 'react'
import { TEXT_KEYS } from 'src/resources/texts'
import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Upload, message, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import './BugReportForm.scss'
const { Option } = Select;



interface BugReportFormData {
  title: string
  description: string
  environment: string
  expectedBehavior: string
  actualBehavior: string
  reproducibility: string
  attachments: any[]
  contactName: string
  contactEmail: string
}

const BugReportForm: React.FC = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);


  //Not implemented yet
  const onFinish = async (values: BugReportFormData) => {
    try {
      // Send the bug report data to the server
      // Include fileList in the values if needed

      // const response = await axios.post('http://localhost:3001/create-issue', {
      //   ...values,
      //   attachments: fileList,
      // })

      console.log(values)

      // Handle the server response
      // message.success('Bug report submitted successfully!')
      message.success('Not implemented!')
      form.resetFields()
      setFileList([]) // Reset fileList after submission
    } catch (error) {
      console.error('Error submitting bug report:', error)
      message.error('Error submitting bug report. Please try again.')
    }
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  const onFileChange = (info: any) => {
    setFileList(info.fileList)
  }

  return (
    <div className="bug-report-form-container">
      <h1 className="logo">דאטאבוס</h1>

      <span> {t(TEXT_KEYS.bug_form_description)} </span>
      <br />
      <br />

      <Form
        form={form}
        name="bug-report"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}>
        <Form.Item
          label={t(TEXT_KEYS.bug_type)}
          name="type"
          initialValue={selectedType}
          rules={[{ required: true, message: t(TEXT_KEYS.bug_type_message) }]}>
          <Select onChange={(value) => setSelectedType(value)}>
            <Option value="bug">{t(TEXT_KEYS.bug_type_bug)}</Option>
            <Option value="feature">{t(TEXT_KEYS.bug_type_feature)}</Option>
          </Select>
        </Form.Item>

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
          <Upload
            beforeUpload={() => false}
            listType="picture"
            fileList={fileList}
            onChange={onFileChange}>
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
