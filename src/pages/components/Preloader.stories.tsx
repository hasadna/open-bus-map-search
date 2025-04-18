import type { Meta, StoryObj } from '@storybook/react'
import { Suspense } from 'react'
import Preloader from 'src/shared/Preloader'

const css = `.preloader{width:80px;height:80px;border:2px solid #f3f3f3;border-top:3px solid #f25a41;border-radius:100%;top:0;bottom:0;left:0;right:0;margin:auto;animation:1s linear infinite spin}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.preloader-bus{position:absolute;top:50%;left:50%;font-size:25px;transform:translate(-50%,-50%)}`

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

export const Default: Story = {
  decorators: [
    (Story) => {
      return (
        <>
          <style>{css}</style>
          <Story />
        </>
      )
    },
  ],
}

export const WithSlowComponent: Story = {
  decorators: [
    (Story) => {
      return (
        <>
          <style>{css}</style>
          <Suspense fallback={<Story />}>
            <SlowComponent />
          </Suspense>
        </>
      )
    },
  ],
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
