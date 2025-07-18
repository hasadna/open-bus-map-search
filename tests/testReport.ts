import type {
  Reporter,
  TestCase,
  TestResult,
  Suite,
  FullConfig,
  FullResult,
} from '@playwright/test/reporter'

class TestReporter implements Reporter {
  executedCount = 0
  totalCount = 0
  passedCount = 0
  failedCount = 0
  skippedCount = 0
  timedOutCount = 0

  countAllTests(suite: Suite): number {
    return suite.suites.reduce((acc, child) => acc + this.countAllTests(child), suite.tests.length)
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.totalCount = this.countAllTests(suite)
    this.executedCount = 0
    this.passedCount = 0
    this.failedCount = 0
    this.skippedCount = 0
    this.timedOutCount = 0
    console.log(`🔎  Starting test run: ${this.totalCount} tests found`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let statusIcon = '⚠️'
    switch (result.status) {
      case 'passed':
        statusIcon = '✅'
        this.passedCount++
        break
      case 'failed':
        statusIcon = '❌'
        this.failedCount++
        break
      case 'skipped':
        statusIcon = '⏭️'
        this.skippedCount++
        break
      case 'timedOut':
        statusIcon = '⏰'
        this.timedOutCount++
        break
      default:
        break
    }
    this.executedCount++
    const duration = result.duration ? `${(result.duration / 1000).toFixed(2)}s` : 'N/A'
    const filePath = test.location ? test.location.file : 'unknown file'
    console.log(
      `${statusIcon}  Test ${this.executedCount} of ${this.totalCount}: ${test.title} - ${result.status} (${duration}) [${filePath}]`,
    )
  }

  onEnd(result: FullResult) {
    console.log(
      `📝  Test run completed ${result.status}: ${this.executedCount} tests executed in ${(result.duration / 1000 / 60).toFixed(2)} min`,
    )
    console.log(
      `🧾  Summary: ✅  Passed: ${this.passedCount}, ❌  Failed: ${this.failedCount}, ⏭️  Skipped: ${this.skippedCount}, ⏰  Timed Out: ${this.timedOutCount}`,
    )
    if (result.status === 'failed') {
      console.error('Some tests failed. Please check the logs above for details.')
    }
  }
}

export default TestReporter
