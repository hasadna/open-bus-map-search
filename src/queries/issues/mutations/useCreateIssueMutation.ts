import { useMutation } from '@tanstack/react-query'
import { createIssue } from 'src/api/issues'

export function useCreateIssueMutation() {
  return useMutation({
    mutationFn: createIssue,
    onError: (error) => {
      console.error('Error submitting bug report:', error)
    },
  })
}
