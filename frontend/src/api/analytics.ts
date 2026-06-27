import { apiClient, IssueSort } from "./repos";

export interface LabelCount {
  label: string;
  count: number;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

export interface CommentedIssue {
  number: number;
  title: string;
  comments: number;
  html_url: string;
}

export interface RepoStats {
  owner: string;
  name: string;
  open_count: number;
  closed_count: number;
  sample_size: number;
  label_distribution: LabelCount[];
  recent_activity: ActivityPoint[];
  most_commented: CommentedIssue[];
}

export async function fetchRepoStats(
  owner: string,
  name: string,
  params: { page: number; perPage: number; search: string; sort: IssueSort }
): Promise<RepoStats> {
  const response = await apiClient.get<RepoStats>(`/api/repos/${owner}/${name}/stats`, {
    params: {
      page: params.page,
      per_page: params.perPage,
      search: params.search,
      sort: params.sort,
    },
  });
  return response.data;
}
