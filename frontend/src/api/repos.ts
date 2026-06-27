import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: string[];
  comments: number;
  author: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export type IssueSort = "recent" | "most_commented" | "oldest";

export interface RepoIssuesResponse {
  owner: string;
  name: string;
  total_open_issues: number;
  issues: Issue[];
  page: number;
  per_page: number;
  has_next: boolean;
  has_previous: boolean;
  search: string;
  sort: IssueSort;
  analytics_note: string;
}

export interface AnalyzeRepoOptions {
  page?: number;
  perPage?: number;
  search?: string;
  sort?: IssueSort;
}

export async function analyzeRepo(
  repoUrl: string,
  options: AnalyzeRepoOptions = {}
): Promise<RepoIssuesResponse> {
  const response = await apiClient.post<RepoIssuesResponse>("/api/repos/analyze", {
    repo_url: repoUrl,
    page: options.page ?? 1,
    per_page: options.perPage ?? 100,
    search: options.search ?? "",
    sort: options.sort ?? "recent",
  });
  return response.data;
}
