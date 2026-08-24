import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { statusLabel } from '../utils/format';

const STYLES = {
  uploaded: 'bg-line/60 text-ink-soft',
  transcribing: 'bg-amber-soft text-amber',
  summarizing: 'bg-amber-soft text-amber',
  completed: 'bg-signal-soft text-signal-dark',
  failed: 'bg-dangerSoft text-danger',
};

const ICONS = {
  uploaded: Clock,
  transcribing: Loader2,
  summarizing: Loader2,
  completed: CheckCircle2,
  failed: AlertCircle,
};

export default function StatusBadge({ status }) {
  const Icon = ICONS[status] || Clock;
  const spinning = status === 'transcribing' || status === 'summarizing';

  return (
    <span className={`badge ${STYLES[status] || STYLES.uploaded}`}>
      <Icon size={13} className={spinning ? 'animate-spin' : ''} />
      {statusLabel(status)}
    </span>
  );
}
