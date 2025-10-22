import { GovStationsByLinePostRequest } from '@hasadna/open-bus-api-client'
import { useQuery } from '@tanstack/react-query'
import {
  Checkbox,
  type CheckboxProps,
  DatePicker,
  type DatePickerProps,
  Form,
  Input,
  type InputProps,
  Select,
  type SelectProps,
  TimePicker,
  type TimePickerProps,
  type TimeRangePickerProps,
} from 'antd'
import type { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { GOVERNMENT_TRANSPORTATION_API } from 'src/api/apiConfig'

// --- Validators ---
const hebOnly = /^[א-ת,\s,',"]+$/u
const numberOnly = /^\d+$/

const createIdValidator = (): Rule => ({
  validator: async (_, value: string) => {
    if (!value || value.length !== 9 || !numberOnly.test(value)) throw new Error('Invalid ID')
    const sum = value
      .split('')
      .map((digit, i) => Number(digit) * ((i % 2) + 1))
      .reduce((acc, n) => acc + Math.floor(n / 10) + (n % 10), 0)
    if (sum % 10 !== 0) throw new Error('Invalid ID number')
    return Promise.resolve()
  },
})

const createRavKavValidator = (): Rule => ({
  validator: async (_, value: string) => {
    if (!numberOnly.test(value)) throw new Error('Invalid Rav Kav number')
    return Promise.resolve()
  },
})

// ---   Field Components ---
const commonStyle = { width: '100%' }

const fieldComponents = {
  Input: (props: InputProps) => <Input {...props} style={commonStyle} />,
  TextArea: (props: TextAreaProps) => <Input.TextArea {...props} style={commonStyle} />,
  DatePicker: (props: DatePickerProps) => {
    const useGovTime = useQuery({
      queryKey: ['gov_time'],
      queryFn: () => GOVERNMENT_TRANSPORTATION_API.govTimeGet(),
    })
    const govTime = useMemo(
      () => dayjs(useGovTime.data?.data?.serverTime),
      [useGovTime.data?.data?.serverTime],
    )
    return (
      <DatePicker
        {...props}
        value={dayjs(props.value)}
        style={commonStyle}
        disabledDate={(d) => !(d.isAfter(govTime.subtract(60, 'day')) && d.isBefore(govTime))}
      />
    )
  },
  TimePicker: (props: TimePickerProps) => (
    <TimePicker {...props} style={commonStyle} format="HH:mm" />
  ),
  TimeRangePicker: (props: TimeRangePickerProps) => {
    return <TimePicker.RangePicker {...props} style={commonStyle} format="HH:mm" />
  },
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  Select: (props: SelectProps) => <Select {...props} style={commonStyle} />,
  BusOpreatorSelect: (props: SelectProps) => {
    const useBusOpratorQueary = useQuery({
      queryKey: ['busOpreator'],
      queryFn: async () => {
        const res = await GOVERNMENT_TRANSPORTATION_API.govOperatorsGet()
        return res.data?.map(({ dataText, dataCode }) => ({ label: dataText, value: dataCode }))
      },
    })
    return (
      <Select
        {...props}
        options={props.options || useBusOpratorQueary.data}
        disabled={props.disabled || useBusOpratorQueary.isLoading}
        style={commonStyle}
      />
    )
  },
  BordingStationSelector: ({
    queary,
    ...props
  }: SelectProps & { queary?: Partial<GovStationsByLinePostRequest> }) => {
    const keys = Object.values(queary || {})
    console.log(keys)

    const useBordingStationQueary = useQuery({
      queryKey: ['Bording_station', ...keys],
      queryFn: async () => {
        console.log(queary)

        if (
          !queary?.officelineId ||
          !queary?.directions ||
          !queary?.eventDate ||
          !queary?.operatorId
        ) {
          return []
        }
        const res = await GOVERNMENT_TRANSPORTATION_API.govStationsByLinePost({
          govStationsByLinePostRequest: queary as GovStationsByLinePostRequest,
        })
        return res.data?.map(({ stationFullName, stationId }) => ({
          label: stationFullName,
          value: stationId,
        }))
      },
    })

    return (
      <Select
        {...props}
        options={props.options || useBordingStationQueary.data}
        disabled={props.disabled || useBordingStationQueary.isLoading}
        style={commonStyle}
      />
    )
  },
} as const

type FieldType = keyof typeof fieldComponents

type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  initialValue?: any
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
}

export function renderField({ name, initialValue, props, rules, type }: FormFieldProps) {
  const Component = fieldComponents[type]
  return (
    <Form.Item key={name} name={name} label={name} rules={rules} initialValue={initialValue}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} />
    </Form.Item>
  )
}

function createField<T extends FieldType>(
  name: string,
  type: T,
  rules?: Rule[],
  props?: React.ComponentProps<(typeof fieldComponents)[T]>,
): FormFieldProps<T> {
  return { name, type, rules, props }
}

export const allComplaintFields = {
  firstName: createField('firstName', 'Input', [{ required: true, pattern: hebOnly }], {
    maxLength: 25,
  }),
  lastName: createField('lastName', 'Input', [{ required: true, pattern: hebOnly }], {
    maxLength: 25,
  }),
  id: createField('id', 'Input', [{ required: true, len: 9 }, createIdValidator()], {
    maxLength: 9,
  }),
  email: createField('email', 'Input', [{ type: 'email', required: true }]),
  phone: createField('phone', 'Input', [{ required: true }], { maxLength: 11 }),
  description: createField('description', 'TextArea', [{ required: true, min: 2 }], {
    rows: 4,
    maxLength: 2000,
  }),
  operator: createField('operator', 'BusOpreatorSelect', [{ required: true }]),
  licensePlate: createField('licensePlate', 'Input', [{ required: true }]),
  eventDate: createField('eventDate', 'DatePicker', [{ required: true }]),
  lineNumber: createField('lineNumber', 'Input', [{ required: true }]),
  eventTime: createField('time', 'TimePicker', [{ required: true }]),
  route: createField('route', 'Input', [{ required: true }]),
  wait: createField('wait', 'TimeRangePicker', [{ required: true }]),
  boardingStation: createField('boardingStation', 'BordingStationSelector'),
  traveledFromOptional: createField('traveledFromOptional', 'Input'),
  traveledToOptional: createField('traveledToOptional', 'Input'),
  traveledFrom: createField('traveledFrom', 'Input', [{ required: true }]),
  traveledTo: createField('traveledTo', 'Input', [{ required: true }]),
  lineActiveDate: createField('lineActiveDate', 'Input', [{ required: true }]),
  addRemoveStationReason: createField('addRemoveStationReason', 'Input', [{ required: true }]),
  requestedStationAddress: createField('requestedStationAddress', 'Input', [{ required: true }]),
  boardingLocality: createField('boardingLocality', 'Input', [{ required: true }]),
  destinationLocality: createField('destinationLocality', 'Input', [{ required: true }]),
  addFrequencyReason: createField('addFrequencyReason', 'Input', [{ required: true }]),
  willingToTestifyMOT: createField('willingToTestifyMOT', 'Checkbox'),
  willingToTestifyCourt: createField('willingToTestifyCourt', 'Checkbox'),
  ravKavNumber: createField(
    'ravKavNumber',
    'Input',
    [{ required: true, min: 11 }, createRavKavValidator()],
    { maxLength: 11 },
  ),
  stationCatNum: createField('stationCatNum', 'Input', [{ required: true }]),
} as const
