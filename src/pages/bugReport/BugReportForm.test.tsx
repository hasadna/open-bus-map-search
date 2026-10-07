import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import i18next from 'i18next'
import { MemoryRouter } from 'react-router'
import { describe, expect, test, vi } from 'vitest'
import BugReportForm from './BugReportForm'

const issuesCreatePost = vi.hoisted(() => vi.fn())

vi.mock('src/api/apiConfig', () => ({
  ISSUES_API: {
    issuesCreatePost,
  },
}))

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <BugReportForm />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('BugReportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    issuesCreatePost.mockResolvedValue({
      data: { number: 1347, id: 123456 },
    })
  })

  test('submits with fallback email when email is omitted', async () => {
    renderForm()

    // Select type
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_type')))
    const bugOption = await screen.findByText(i18next.t('bug_type_bug'))
    fireEvent.click(bugOption)

    // Fill title
    fireEvent.change(screen.getByLabelText(i18next.t('bug_title')), {
      target: { value: 'Test bug title with enough chars' },
    })

    // Fill name
    fireEvent.change(screen.getByLabelText(i18next.t('bug_contact_name')), {
      target: { value: 'Anonymous Reporter' },
    })

    // Leave email blank

    // Fill description
    fireEvent.change(screen.getByLabelText(i18next.t('bug_description')), {
      target: { value: 'Detailed description about the problem occurring on the map' },
    })

    // Fill expected and actual
    fireEvent.change(screen.getByLabelText(i18next.t('bug_expected_behavior')), {
      target: { value: 'Expected smooth operation' },
    })
    fireEvent.change(screen.getByLabelText(i18next.t('bug_actual_behavior')), {
      target: { value: 'Actual failure occurred' },
    })

    // Select reproducibility
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_reproducibility')))
    const alwaysOption = await screen.findByText(i18next.t('bug_frequency.always'))
    fireEvent.click(alwaysOption)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: i18next.t('bug_submit') }))

    await waitFor(() => {
      expect(issuesCreatePost).toHaveBeenCalledTimes(1)
    })

    const submittedRequest = issuesCreatePost.mock.calls[0][0].createIssuePostRequest
    expect(submittedRequest.contactEmail).toBe('anonymous@hasadna.org.il')
    expect(submittedRequest.description).not.toContain('Contact Email for Follow-up')
  })

  test('submits user email and appends follow-up to description when consent is checked', async () => {
    renderForm()

    // Select type
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_type')))
    const bugOption = await screen.findByText(i18next.t('bug_type_bug'))
    fireEvent.click(bugOption)

    // Fill title
    fireEvent.change(screen.getByLabelText(i18next.t('bug_title')), {
      target: { value: 'Another bug title with enough length' },
    })

    // Fill name
    fireEvent.change(screen.getByLabelText(i18next.t('bug_contact_name')), {
      target: { value: 'Jane Doe' },
    })

    // Fill email
    fireEvent.change(screen.getByLabelText(i18next.t('bug_contact_email')), {
      target: { value: 'jane.doe@example.com' },
    })

    // Consent checkbox should now be visible; check it
    const consentCheckbox = await screen.findByLabelText(i18next.t('bug_contact_consent'))
    fireEvent.click(consentCheckbox)

    // Fill description
    fireEvent.change(screen.getByLabelText(i18next.t('bug_description')), {
      target: { value: 'Detailed description about the problem occurring on the map' },
    })

    // Fill expected and actual
    fireEvent.change(screen.getByLabelText(i18next.t('bug_expected_behavior')), {
      target: { value: 'Expected smooth operation' },
    })
    fireEvent.change(screen.getByLabelText(i18next.t('bug_actual_behavior')), {
      target: { value: 'Actual failure occurred' },
    })

    // Select reproducibility
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_reproducibility')))
    const alwaysOption = await screen.findByText(i18next.t('bug_frequency.always'))
    fireEvent.click(alwaysOption)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: i18next.t('bug_submit') }))

    await waitFor(() => {
      expect(issuesCreatePost).toHaveBeenCalledTimes(1)
    })

    const submittedRequest = issuesCreatePost.mock.calls[0][0].createIssuePostRequest
    expect(submittedRequest.contactEmail).toBe('jane.doe@example.com')
    expect(submittedRequest.description).toContain(
      '**Contact Email for Follow-up:** jane.doe@example.com',
    )
  })

  test('blocks submission if email is entered without checking consent', async () => {
    renderForm()

    // Select type
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_type')))
    const bugOption = await screen.findByText(i18next.t('bug_type_bug'))
    fireEvent.click(bugOption)

    // Fill title
    fireEvent.change(screen.getByLabelText(i18next.t('bug_title')), {
      target: { value: 'Another bug title with enough length' },
    })

    // Fill name
    fireEvent.change(screen.getByLabelText(i18next.t('bug_contact_name')), {
      target: { value: 'Jane Doe' },
    })

    // Fill email
    fireEvent.change(screen.getByLabelText(i18next.t('bug_contact_email')), {
      target: { value: 'jane.doe@example.com' },
    })

    // Do NOT check consent checkbox

    // Fill description
    fireEvent.change(screen.getByLabelText(i18next.t('bug_description')), {
      target: { value: 'Detailed description about the problem occurring on the map' },
    })

    // Fill expected and actual
    fireEvent.change(screen.getByLabelText(i18next.t('bug_expected_behavior')), {
      target: { value: 'Expected smooth operation' },
    })
    fireEvent.change(screen.getByLabelText(i18next.t('bug_actual_behavior')), {
      target: { value: 'Actual failure occurred' },
    })

    // Select reproducibility
    fireEvent.mouseDown(screen.getByLabelText(i18next.t('bug_reproducibility')))
    const alwaysOption = await screen.findByText(i18next.t('bug_frequency.always'))
    fireEvent.click(alwaysOption)

    // Submit
    fireEvent.click(screen.getByRole('button', { name: i18next.t('bug_submit') }))

    await waitFor(() => {
      expect(screen.getByText(i18next.t('bug_contact_consent_required'))).toBeInTheDocument()
    })

    expect(issuesCreatePost).not.toHaveBeenCalled()
  })
})
