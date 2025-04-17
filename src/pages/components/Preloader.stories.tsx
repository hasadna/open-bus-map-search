import type { Meta, StoryObj } from '@storybook/react'
import { Suspense } from 'react'
import Preloader from 'src/shared/Preloader'

const meta: Meta<typeof Preloader> = {
  component: Preloader,
  title: 'Components/Preloader',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSlowComponent: Story = {
  decorators: [
    (Story) => {
      return (
        <Suspense fallback={<Story />}>
          <SlowComponent />
        </Suspense>
      )
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates the Preloader component being used as a fallback while content loads.',
      },
    },
  },
}

let fulfilled = false
let promise: Promise<void> | null = null

const useTimeout = (ms: number) => {
  if (!fulfilled) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw (promise ||= new Promise((resolve) => {
      setTimeout(() => {
        fulfilled = true
        resolve()
      }, ms)
    }))
  }
}

const SlowComponent = () => {
  useTimeout(2000)

  return (
    <div
      dir="ltr"
      style={{
        padding: '1rem',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 500,
      }}>
      Component loaded after 2 seconds! 🎉
    </div>
  )
}
