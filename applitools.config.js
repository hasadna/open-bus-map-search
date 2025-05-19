export default {
  waitBeforeCapture() {
    return !document.querySelector('.ant-skeleton-content')
    // async waitBeforeCapture() {
    //   while (!document.querySelector('.ant-skeleton-content')) {
    //     await new Promise((resolve) => {
    //       setTimeout(resolve, 100)
    //     })
    //   }
    // },
  },
}
