import { apiClient } from "./repos";

export interface IssueAnalysis {
  summary: string;
  key_problems: string[];
  important_comments: string[];
  suggested_next_steps: string[];
  cached: boolean;
}

export async function analyzeIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  forceRefresh = false
): Promise<IssueAnalysis> {
  const response = await apiClient.get<IssueAnalysis>(
    `/api/issues/${owner}/${repo}/${issueNumber}/analyze`,
    { params: forceRefresh ? { force_refresh: true } : {} }
  );
  return response.data;
}
