import { apiClient } from "./repos";

export interface AnalysisHistoryItem {
  id: number;
  repo_owner: string;
  repo_name: string;
  issue_number: number;
  issue_title: string;
  summary: string;
  key_problems: string[];
  important_comments: string[];
  suggested_next_steps: string[];
  analyzed_at: string;
}

export interface AnalysisHistoryListResponse {
  total: number;
  items: AnalysisHistoryItem[];
}

export async function fetchHistory(
  query: string,
  page = 1
): Promise<AnalysisHistoryListResponse> {
  const response = await apiClient.get<AnalysisHistoryListResponse>("/api/history", {
    params: { q: query || undefined, page, limit: 20 },
  });
  return response.data;
}
