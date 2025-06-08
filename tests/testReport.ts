import type { Reporter, TestCase, TestResult, Suite, FullConfig } from '@playwright/test/reporter'

let executedCount = 0
let totalCount = 0

function countAllTests(suite: Suite): number {
  return suite.suites.reduce((acc, child) => acc + countAllTests(child), suite.tests.length)
}

class TestReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    totalCount = countAllTests(suite)
    console.log(`🔎 Starting test run: ${totalCount} tests found`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️'
    console.log(
      `${statusIcon} Test ${++executedCount}/${totalCount}: ${test.title} - ${result.status}`,
    )
  }
}

export default TestReporter
