import type {
  Reporter,
  TestCase,
  TestResult,
  Suite,
  FullConfig,
  FullResult,
} from '@playwright/test/reporter'

let executedCount = 0
let totalCount = 0

function countAllTests(suite: Suite): number {
  return suite.suites.reduce((acc, child) => acc + countAllTests(child), suite.tests.length)
}

function getStatusIcon(status: string) {
  return status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️'
}

class TestReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    totalCount = countAllTests(suite)
    console.log(`🔎 Starting test run: ${totalCount} tests found`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(
      `${getStatusIcon(result.status)} Test ${++executedCount}/${totalCount}: ${test.title} - ${result.status}`,
    )
  }

  onEnd(result: FullResult) {
    console.log(
      `${getStatusIcon(result.status)} Test run completed: ${executedCount}/${totalCount} tests executed in ${result.duration}ms`,
    )
    if (result.status === 'failed') {
      console.error('Some tests failed. Please check the logs above for details.')
    }
  }
}

export default TestReporter
