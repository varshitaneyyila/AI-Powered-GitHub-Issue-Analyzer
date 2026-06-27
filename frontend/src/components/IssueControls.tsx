import { FormEvent, useState } from "react";
import { IssueSort } from "../api/repos";

interface Props {
  search: string;
  sort: IssueSort;
  loading: boolean;
  onApply: (search: string, sort: IssueSort) => void;
}

export default function IssueControls({ search, sort, loading, onApply }: Props) {
  const [searchDraft, setSearchDraft] = useState(search);
  const [sortDraft, setSortDraft] = useState<IssueSort>(sort);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onApply(searchDraft.trim(), sortDraft);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <input
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search issue title, e.g. bug, auth, docs"
          className="rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm text-gray-100 placeholder-muted outline-none focus:border-accent"
        />
        <select
          value={sortDraft}
          onChange={(e) => setSortDraft(e.target.value as IssueSort)}
          className="rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm text-gray-100 outline-none focus:border-accent"
        >
          <option value="recent">Most recent</option>
          <option value="most_commented">Most commented</option>
          <option value="oldest">Oldest</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-accent px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent hover:text-canvas disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
