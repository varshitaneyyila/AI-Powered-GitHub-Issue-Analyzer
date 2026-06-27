import { apiClient } from "./repos";

export interface Favorite {
  id: number;
  repo_owner: string;
  repo_name: string;
  created_at: string;
}

export async function listFavorites(): Promise<Favorite[]> {
  const response = await apiClient.get<Favorite[]>("/api/favorites");
  return response.data;
}

export async function addFavorite(owner: string, name: string): Promise<Favorite> {
  const response = await apiClient.post<Favorite>("/api/favorites", {
    repo_owner: owner,
    repo_name: name,
  });
  return response.data;
}

export async function removeFavorite(owner: string, name: string): Promise<void> {
  await apiClient.delete(`/api/favorites/${owner}/${name}`);
}
