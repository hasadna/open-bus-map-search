import { test, expect } from '@playwright/test'

test('sanity test', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
})

test('basic load test - sends a 100 requests', async ({ request }) => {
  const promises = []
  //an array of 100 requests
  for (let i = 0; i < 100; i++) promises.push(request.get('/'))
  //request all in parallel
  const responses = await Promise.all(promises)
  for (const response of responses) {
    expect(response.status()).toBe(200)
  }
})
