import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AudioWaveform, ListChecks, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMeetings, deleteMeetingById } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { formatDate } from '../utils/format';

const FILTERS = ['all', 'completed', 'processing', 'failed'];

export default function MeetingHistory() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMeetings()
      .then(setMeetings)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const matchesQuery = m.title?.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'processing' && ['uploaded', 'transcribing', 'summarizing'].includes(m.status)) ||
        m.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [meetings, query, filter]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this meeting? This cannot be undone.')) return;

    try {
      await deleteMeetingById(id);
      setMeetings((prev) => prev.filter((m) => m._id !== id));
      toast.success('Meeting deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Meeting History</h1>
      <p className="mt-1 text-sm text-ink-faint">Browse and revisit every meeting you've processed.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings by title…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-signal"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={AudioWaveform}
            title={meetings.length === 0 ? 'No meetings yet' : 'No matches found'}
            description={
              meetings.length === 0
                ? 'Upload your first meeting recording to see it here.'
                : 'Try a different search term or filter.'
            }
            actionLabel={meetings.length === 0 ? 'Upload Meeting' : undefined}
            actionTo={meetings.length === 0 ? '/upload' : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <Link
                key={m._id}
                to={`/meetings/${m._id}`}
                className="card flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:border-signal/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{m.title}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-ink-faint">
                    {m.summary ? m.summary.slice(0, 110) : 'No summary yet.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-ink-faint">
                  <span className="flex items-center gap-1">
                    <ListChecks size={13} /> {m.actionItems?.length || 0} items
                  </span>
                  <span>{formatDate(m.createdAt)}</span>
                  <button
                    onClick={(e) => handleDelete(e, m._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-dangerSoft hover:text-danger"
                    aria-label="Delete meeting"
                    title="Delete meeting"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
