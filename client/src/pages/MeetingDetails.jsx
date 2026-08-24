import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Copy,
  Trash2,
  FileText,
  ListChecks,
  ClipboardList,
  ScrollText,
  LayoutList,
} from 'lucide-react';
import { fetchMeetingById, deleteMeetingById } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PipelineTracker from '../components/PipelineTracker';
import { formatDate } from '../utils/format';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutList },
  { key: 'summary', label: 'Summary', icon: FileText },
  { key: 'keyPoints', label: 'Key Points', icon: ListChecks },
  { key: 'decisions', label: 'Decisions', icon: ClipboardList },
  { key: 'actionItems', label: 'Action Items', icon: ListChecks },
  { key: 'transcript', label: 'Transcript', icon: ScrollText },
];

const PRIORITY_STYLES = {
  High: 'bg-dangerSoft text-danger',
  Medium: 'bg-amber-soft text-amber',
  Low: 'bg-signal-soft text-signal-dark',
};

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [notFoundOrError, setNotFoundOrError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMeetingById(id)
      .then(setMeeting)
      .catch((err) => setNotFoundOrError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this meeting? This cannot be undone.')) return;
    try {
      await deleteMeetingById(id);
      toast.success('Meeting deleted');
      navigate('/meetings');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(meeting.transcript || '');
    toast.success('Transcript copied to clipboard');
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-center text-ink-faint">Loading meeting…</div>;
  }

  if (notFoundOrError || !meeting) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-lg font-semibold text-ink">Meeting not found</p>
        <p className="mt-1 text-sm text-ink-faint">{notFoundOrError || 'This meeting may have been deleted.'}</p>
        <Link to="/meetings" className="btn-secondary mt-6 inline-flex">
          <ArrowLeft size={15} /> Back to History
        </Link>
      </div>
    );
  }

  const isProcessing = ['uploaded', 'transcribing', 'summarizing'].includes(meeting.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/meetings" className="flex items-center gap-1 text-sm font-medium text-ink-faint hover:text-ink">
        <ArrowLeft size={14} /> Back to History
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{meeting.title}</h1>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="mt-1 text-sm text-ink-faint">{formatDate(meeting.createdAt)}</p>
        </div>
        <button onClick={handleDelete} className="btn-secondary text-danger hover:border-danger">
          <Trash2 size={15} /> Delete
        </button>
      </div>

      {(isProcessing || meeting.status === 'failed') && (
        <div className="card mt-6 p-6">
          <PipelineTracker status={meeting.status} />
          {meeting.status === 'failed' && meeting.errorMessage && (
            <div className="mt-6 rounded-lg bg-dangerSoft px-4 py-3 text-sm font-medium text-danger">
              {meeting.errorMessage}
            </div>
          )}
        </div>
      )}

      {meeting.status === 'completed' && (
        <>
          <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper'
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <div className="card mt-4 p-6">
            {tab === 'overview' && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  Overview
                </h3>
                <p className="mt-3 leading-relaxed text-ink">{meeting.overview || 'Not specified'}</p>
              </div>
            )}

            {tab === 'summary' && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  Summary
                </h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">
                  {meeting.summary || 'Not specified'}
                </p>
              </div>
            )}

            {tab === 'keyPoints' && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  Key Points
                </h3>
                {meeting.keyPoints?.length ? (
                  <ul className="mt-3 space-y-2.5">
                    {meeting.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 text-ink">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">No key points identified.</p>
                )}
              </div>
            )}

            {tab === 'decisions' && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  Decisions
                </h3>
                {meeting.decisions?.length ? (
                  <div className="mt-3 space-y-3">
                    {meeting.decisions.map((d, i) => (
                      <div key={i} className="rounded-lg border border-line bg-paper px-4 py-3 text-ink">
                        {d}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">No decisions were identified in this meeting.</p>
                )}
              </div>
            )}

            {tab === 'actionItems' && (
              <div>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                  Action Items
                </h3>
                {meeting.actionItems?.length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                          <th className="py-2 pr-4 font-medium">Task</th>
                          <th className="py-2 pr-4 font-medium">Assignee</th>
                          <th className="py-2 pr-4 font-medium">Deadline</th>
                          <th className="py-2 font-medium">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meeting.actionItems.map((item, i) => (
                          <tr key={i} className="border-b border-line/60 last:border-0">
                            <td className="py-3 pr-4 text-ink">{item.task}</td>
                            <td className="py-3 pr-4 text-ink-soft">{item.assignee}</td>
                            <td className="py-3 pr-4 text-ink-soft">{item.deadline}</td>
                            <td className="py-3">
                              <span
                                className={`badge ${PRIORITY_STYLES[item.priority] || 'bg-line/60 text-ink-soft'}`}
                              >
                                {item.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">No action items were identified.</p>
                )}
              </div>
            )}

            {tab === 'transcript' && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-faint">
                    Transcript
                  </h3>
                  <button onClick={copyTranscript} className="btn-secondary py-1.5 text-xs">
                    <Copy size={13} /> Copy
                  </button>
                </div>
                <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-line bg-paper p-4">
                  <p className="whitespace-pre-line font-mono text-sm leading-relaxed text-ink-soft">
                    {meeting.transcript || 'No transcript available.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
