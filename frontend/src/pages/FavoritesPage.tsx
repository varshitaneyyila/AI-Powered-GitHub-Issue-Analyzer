import { useEffect, useState } from "react";
import { Favorite, listFavorites, removeFavorite } from "../api/favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  async function loadFavorites() {
    setLoading(true);
    setError(null);
    try {
      const result = await listFavorites();
      setFavorites(result);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function handleRemove(owner: string, name: string) {
    const key = `${owner}/${name}`;
    setRemovingKey(key);
    setError(null);
    try {
      await removeFavorite(owner, name);
      setFavorites((current) => current.filter((repo) => !(repo.repo_owner === owner && repo.repo_name === name)));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not remove favorite. Please try again.");
    } finally {
      setRemovingKey(null);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">saved repos</p>
        <h1 className="mt-1 text-3xl font-semibold">Favorite Repositories</h1>
        <p className="mt-2 text-muted">Repos you saved for quick access while analyzing issues.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-border bg-panel p-5 text-muted">Loading favorites...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-panel p-6 text-muted">
          No favorite repositories yet. Go to Analyze, search a repo, and click ☆ Add to favorites.
        </div>
      ) : (
        <div className="grid gap-3">
          {favorites.map((repo) => {
            const fullName = `${repo.repo_owner}/${repo.repo_name}`;
            const savedDate = new Date(repo.created_at).toLocaleString();
            return (
              <article key={repo.id} className="rounded-lg border border-border bg-panel p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-mono text-lg text-gray-100">{fullName}</h2>
                    <p className="mt-1 text-sm text-muted">Saved {savedDate}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://github.com/${fullName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-border px-3 py-2 font-mono text-xs text-muted hover:text-gray-100"
                    >
                      Open GitHub
                    </a>
                    <button
                      onClick={() => handleRemove(repo.repo_owner, repo.repo_name)}
                      disabled={removingKey === fullName}
                      className="rounded-md border border-red-900 px-3 py-2 font-mono text-xs text-red-300 hover:bg-red-950/40 disabled:opacity-60"
                    >
                      {removingKey === fullName ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
