import type { Meta, StoryObj } from '@storybook/react'
import '../../shared/shared.css'
import { useState } from 'react'
import OperatorSelector from './OperatorSelector'
import { MAJOR_OPERATORS } from 'src/model/operator'

const OperatorSelectorStory = () => {
  const [operatorId, setOperatorId] = useState<string>()

  return (
    <div>
      <h1>בחירת המפעילים הגדולים</h1>
      <OperatorSelector
        operatorId={operatorId}
        setOperatorId={setOperatorId}
        filter={MAJOR_OPERATORS}></OperatorSelector>
      <h1>בחירת כל המפעילים</h1>
      <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId}></OperatorSelector>
    </div>
  )
}

const meta: Meta = {
  title: 'Components/OperatorSelector',
  component: OperatorSelectorStory,
}

export default meta

type Story = StoryObj<typeof meta>

const defaultArgs = {}

export const Default: Story = {
  args: defaultArgs,
}
