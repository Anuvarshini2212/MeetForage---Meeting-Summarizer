import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioWaveform, ListChecks, Loader2, CheckCircle2, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { fetchMeetings, deleteMeetingById } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Skeleton';
import { formatDate } from '../utils/format';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings()
      .then(setMeetings)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = meetings.length;
  const completed = meetings.filter((m) => m.status === 'completed').length;
  const processing = meetings.filter((m) => ['uploaded', 'transcribing', 'summarizing'].includes(m.status)).length;
  const actionItems = meetings.reduce((sum, m) => sum + (m.actionItems?.length || 0), 0);

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

  const stats = [
    { label: 'Total Meetings', value: total, icon: AudioWaveform },
    { label: 'Completed', value: completed, icon: CheckCircle2 },
    { label: 'Processing', value: processing, icon: Loader2 },
    { label: 'Action Items', value: actionItems, icon: ListChecks },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-faint">
            Turn meeting audio into transcripts, summaries, and action items.
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          <Plus size={16} />
          Upload Meeting
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{s.label}</span>
              <s.icon size={16} className="text-signal" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Recent Meetings</h2>
          {meetings.length > 0 && (
            <Link to="/meetings" className="flex items-center gap-1 text-sm font-medium text-signal-dark hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            icon={AudioWaveform}
            title="No meetings yet"
            description="Upload your first meeting recording to get a transcript, summary, and action items in minutes."
            actionLabel="Upload Meeting"
            actionTo="/upload"
          />
        ) : (
          <div className="space-y-3">
            {meetings.slice(0, 5).map((m) => (
              <Link
                key={m._id}
                to={`/meetings/${m._id}`}
                className="card flex items-center justify-between gap-4 p-5 transition-colors hover:border-signal/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{m.title}</p>
                  <p className="mt-1 truncate text-sm text-ink-faint">
                    {m.summary ? m.summary.slice(0, 90) : 'Processing…'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={m.status} />
                    <span className="text-xs text-ink-faint">{formatDate(m.createdAt)}</span>
                  </div>
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
