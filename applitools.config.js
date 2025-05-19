export default {
  async waitBeforeCapture() {
    while (!document.querySelector('.ant-skeleton-content')) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })
    }
  },
}
