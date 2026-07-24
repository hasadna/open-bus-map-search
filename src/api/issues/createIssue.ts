import { CreateIssuePostRequest } from '@hasadna/open-bus-api-client'
import { ISSUES_API } from 'src/api/apiConfig'

export function createIssue(createIssuePostRequest: CreateIssuePostRequest) {
  return ISSUES_API.issuesCreatePost({ createIssuePostRequest })
}
