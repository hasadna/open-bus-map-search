import type { Meta, StoryObj } from '@storybook/react'
import '../../shared/shared.css'
import OperatorSelector, { FilterOperatorOptions } from './OperatorSelector'
import { useState } from 'react'

const OperatorSelectorStory = () => {
  const [operatorId, setOperatorId] = useState<string>()

  return (
    <div>
      <h1>בחירת המפעילים הגדולים</h1>
      <OperatorSelector
        operatorId={operatorId}
        setOperatorId={setOperatorId}
        filter={FilterOperatorOptions.MAJOR}></OperatorSelector>
      <h1>בחירת כל המפעילים</h1>
      <OperatorSelector
        operatorId={operatorId}
        setOperatorId={setOperatorId}
        filter={FilterOperatorOptions.ALL}></OperatorSelector>
      <h1>בחירת המפעילים הרלוונטיים</h1>
      <OperatorSelector
        operatorId={operatorId}
        setOperatorId={() => ''}
        filter={FilterOperatorOptions.RELEVANT}></OperatorSelector>
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
