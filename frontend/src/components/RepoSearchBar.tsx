import { useState, FormEvent } from "react";

interface Props {
  onSubmit: (repoUrl: string) => void;
  loading: boolean;
}

export default function RepoSearchBar({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("https://github.com/octocat/Hello-World");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://github.com/owner/repo"
        className="flex-1 rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm text-gray-200 placeholder-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-canvas transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Fetching…" : "Analyze"}
      </button>
    </form>
  );
}
