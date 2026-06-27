import { useEffect, useState } from "react";
import { addFavorite, removeFavorite, listFavorites } from "../api/favorites";

export default function FavoriteButton({ owner, name }: { owner: string; name: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFavorites().then((favorites) => {
      if (!cancelled) {
        setIsFavorite(favorites.some((f) => f.repo_owner === owner && f.repo_name === name));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [owner, name]);

  async function toggle() {
    setBusy(true);
    try {
      if (isFavorite) {
        await removeFavorite(owner, name);
        setIsFavorite(false);
      } else {
        await addFavorite(owner, name);
        setIsFavorite(true);
      }
    } catch {
      // Swallow conflicts (already favorited) etc. — state just won't change.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        isFavorite
          ? "rounded-md border border-accent bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent"
          : "rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted hover:text-gray-100"
      }
    >
      {isFavorite ? "★ Favorited" : "☆ Add to favorites"}
    </button>
  );
}
