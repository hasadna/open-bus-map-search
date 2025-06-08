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

  countAllTests(suite: Suite): number {
    return suite.suites.reduce((acc, child) => acc + this.countAllTests(child), suite.tests.length)
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.totalCount = this.countAllTests(suite)
    console.log(`🔎 Starting test run: ${this.totalCount} tests found`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const statisIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'
    console.log(
      `Test ${++this.executedCount} of ${this.totalCount}: ${test.title} - ${result.status} ${statisIcon} `,
    )
  }

  onEnd(result: FullResult) {
    console.log(
      `📝 Test run completed ${result.status}: ${this.executedCount} tests executed in ${(result.duration / 1000 / 60).toFixed(2)} min`,
    )
    if (result.status === 'failed') {
      console.error('Some tests failed. Please check the logs above for details.')
    }
  }
}

export default TestReporter
