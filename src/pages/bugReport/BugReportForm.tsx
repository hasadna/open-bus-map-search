import {
  CreateIssuePostRequest,
  CreateIssuePostRequestReproducibilityEnum,
  CreateIssuePostRequestTypeEnum,
} from '@hasadna/open-bus-api-client'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useForm } from '@tanstack/react-form'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { EasterEgg } from 'src/pages/components/EasterEgg/EasterEgg'
import InfoYoutubeModal from 'src/pages/components/YoutubeModal'
import { useCreateIssueMutation } from 'src/queries/issues'
import Widget from 'src/shared/Widget'
import './BugReportForm.scss'

type BugReportLocationState = {
  from?: {
    path: string
    title: string
  }
} | null

type BugReportFormValues = Omit<CreateIssuePostRequest, 'type' | 'reproducibility'> & {
  type: CreateIssuePostRequestTypeEnum | ''
  reproducibility: CreateIssuePostRequestReproducibilityEnum | ''
  debug: boolean
}

const DEFAULT_VALUES: BugReportFormValues = {
  type: '',
  title: '',
  contactName: '',
  contactEmail: '',
  description: '',
  environment: '',
  expectedBehavior: '',
  actualBehavior: '',
  reproducibility: '',
  debug: false,
}

function firstError(errors: unknown[]) {
  return errors.length > 0 ? String(errors[0]) : undefined
}

function toCreateIssuePayload(values: BugReportFormValues): CreateIssuePostRequest {
  return {
    ...values,
    type: values.type as CreateIssuePostRequestTypeEnum,
    reproducibility: values.reproducibility as CreateIssuePostRequestReproducibilityEnum,
  }
}

const BugReportForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const previousPage = (location.state as BugReportLocationState)?.from

  const required = (label: string, value: string) =>
    value.trim()
      ? undefined
      : t('reportBug.validation.required', {
          field: label,
          interpolation: { escapeValue: false },
        })
  const minLength = (label: string, value: string, min: number) =>
    value.trim().length >= min
      ? undefined
      : t('reportBug.validation.min', {
          field: label,
          count: min,
          interpolation: { escapeValue: false },
        })
  const maxLength = (label: string, value: string, max: number) =>
    value.length <= max
      ? undefined
      : t('reportBug.validation.max', {
          field: label,
          count: max,
          interpolation: { escapeValue: false },
        })
  const requiredSelect = (label: string, value: string) =>
    value
      ? undefined
      : t('reportBug.validation.required', {
          field: label,
          interpolation: { escapeValue: false },
        })
  const email = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value) ? undefined : t('reportBug.validation.email')

  const mutation = useCreateIssueMutation()

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: ({ value }) => {
      mutation.reset()
      mutation.mutate(toCreateIssuePayload(value), {
        onSuccess: (response) => {
          if (response.data?.state === 'open') {
            form.reset(DEFAULT_VALUES)
            setSuccessDialogOpen(true)
          }
        },
      })
    },
  })

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false)
    mutation.reset()
  }

  const handleBackToPreviousPage = () => {
    handleCloseSuccessDialog()
    navigate(previousPage?.path || '/')
  }

  const options = useMemo(() => {
    return [
      { value: CreateIssuePostRequestReproducibilityEnum.Always, label: t('bug_frequency.always') },
      {
        value: CreateIssuePostRequestReproducibilityEnum.Sometimes,
        label: t('bug_frequency.sometimes'),
      },
      { value: CreateIssuePostRequestReproducibilityEnum.Rarely, label: t('bug_frequency.rarely') },
      { value: CreateIssuePostRequestReproducibilityEnum.Once, label: t('bug_frequency.once') },
    ]
  }, [t])

  return (
    <Box className="bug-report-page">
      <Widget
        className="bug-report-form-container"
        title={
          <p className="logo">
            {t('website_name')}
            <InfoYoutubeModal
              label={t('open_video_about_this_page')}
              title={t('youtube_modal_info_title')}
              videoUrl="https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11"
            />
          </p>
        }>
        <span>{t('reportBug.description')}</span>

        {mutation.isError && (
          <Alert severity="error" onClose={mutation.reset} sx={{ marginBottom: 2 }}>
            {t('reportBug.error')}
          </Alert>
        )}

        <Box
          component="form"
          className="bug-report-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}>
          <Stack spacing={2.5}>
            <form.Field
              name="type"
              validators={{
                onChange: ({ value }) => requiredSelect(t('bug_type'), value),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <FormControl fullWidth required error={Boolean(error)}>
                    <InputLabel id={`${field.name}-label`}>{t('bug_type')}</InputLabel>
                    <Select
                      labelId={`${field.name}-label`}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      label={t('bug_type')}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}>
                      <MenuItem value={CreateIssuePostRequestTypeEnum.Bug}>
                        {t('bug_type_bug')}
                      </MenuItem>
                      <MenuItem value={CreateIssuePostRequestTypeEnum.Feature}>
                        {t('bug_type_feature')}
                      </MenuItem>
                      <MenuItem value={CreateIssuePostRequestTypeEnum.Other}>
                        {t('bug_type_other')}
                      </MenuItem>
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                  </FormControl>
                )
              }}
            </form.Field>

            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_title'), value) ||
                  minLength(t('bug_title'), value, 5) ||
                  maxLength(t('bug_title'), value, 200),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    id={field.name}
                    name={field.name}
                    label={t('bug_title')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="contactName"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_contact_name'), value) ||
                  minLength(t('bug_contact_name'), value, 1) ||
                  maxLength(t('bug_contact_name'), value, 100),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    id={field.name}
                    name={field.name}
                    label={t('bug_contact_name')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="contactEmail"
              validators={{
                onChange: ({ value }) => required(t('bug_contact_email'), value) || email(value),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    id={field.name}
                    name={field.name}
                    type="email"
                    label={t('bug_contact_email')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_description'), value) ||
                  minLength(t('bug_description'), value, 10) ||
                  maxLength(t('bug_description'), value, 5000),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    id={field.name}
                    name={field.name}
                    label={t('bug_description')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="environment"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_environment'), value) ||
                  minLength(t('bug_environment'), value, 1) ||
                  maxLength(t('bug_environment'), value, 200),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    id={field.name}
                    name={field.name}
                    label={t('bug_environment')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="expectedBehavior"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_expected_behavior'), value) ||
                  minLength(t('bug_expected_behavior'), value, 5) ||
                  maxLength(t('bug_expected_behavior'), value, 1000),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    id={field.name}
                    name={field.name}
                    label={t('bug_expected_behavior')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="actualBehavior"
              validators={{
                onChange: ({ value }) =>
                  required(t('bug_actual_behavior'), value) ||
                  minLength(t('bug_actual_behavior'), value, 5) ||
                  maxLength(t('bug_actual_behavior'), value, 1000),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <TextField
                    required
                    fullWidth
                    multiline
                    minRows={4}
                    id={field.name}
                    name={field.name}
                    label={t('bug_actual_behavior')}
                    value={field.state.value}
                    error={Boolean(error)}
                    helperText={error}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )
              }}
            </form.Field>

            <form.Field
              name="reproducibility"
              validators={{
                onChange: ({ value }) => requiredSelect(t('bug_reproducibility'), value),
              }}>
              {(field) => {
                const error = firstError(field.state.meta.errors)

                return (
                  <FormControl fullWidth required error={Boolean(error)}>
                    <InputLabel id={`${field.name}-label`}>{t('bug_reproducibility')}</InputLabel>
                    <Select
                      labelId={`${field.name}-label`}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      label={t('bug_reproducibility')}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}>
                      {options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error}</FormHelperText>}
                  </FormControl>
                )
              }}
            </form.Field>

            <EasterEgg
              code="debug"
              autohide={false}
              onShow={() => form.setFieldValue('debug', true)}>
              <form.Field name="debug">
                {(field) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.checked)}
                      />
                    }
                    // eslint-disable-next-line i18next/no-literal-string -- hidden developer toggle
                    label="debug"
                  />
                )}
              </form.Field>
            </EasterEgg>

            <Box className="bug-report-form-actions">
              <form.Subscribe selector={(state) => state.canSubmit}>
                {(canSubmit) => (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!canSubmit || mutation.isPending}
                    loading={mutation.isPending}>
                    {t('bug_submit')}
                  </Button>
                )}
              </form.Subscribe>
            </Box>
          </Stack>
        </Box>
        <Dialog
          open={successDialogOpen}
          onClose={handleCloseSuccessDialog}
          fullWidth
          maxWidth="xs"
          aria-labelledby="bug-report-success-title">
          <DialogTitle id="bug-report-success-title">{t('reportBug.successTitle')}</DialogTitle>
          <DialogContent>{t('reportBug.success')}</DialogContent>
          <DialogActions>
            {mutation.data?.data?.url && (
              <Button
                component="a"
                href={mutation.data.data.url}
                target="_blank"
                rel="noopener noreferrer">
                {t('reportBug.viewIssue')}
              </Button>
            )}
            <Button variant="contained" onClick={handleBackToPreviousPage}>
              {t('reportBug.backToPreviousPage')}
            </Button>
          </DialogActions>
        </Dialog>
      </Widget>
    </Box>
  )
}

export default BugReportForm
