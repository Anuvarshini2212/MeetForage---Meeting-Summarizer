import { Check, Loader2 } from 'lucide-react';

const STAGES = [
  { key: 'uploaded', label: 'Audio uploaded' },
  { key: 'transcribing', label: 'Transcribing audio' },
  { key: 'summarizing', label: 'Analyzing meeting' },
  { key: 'completed', label: 'Complete' },
];

function stageIndex(status) {
  if (status === 'failed') return -1;
  return STAGES.findIndex((s) => s.key === status);
}

export default function PipelineTracker({ status }) {
  const currentIndex = stageIndex(status);

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-line" aria-hidden="true" />
        <div
          className="absolute left-0 top-4 h-0.5 bg-signal transition-all duration-500"
          style={{
            width: currentIndex <= 0 ? '0%' : `${(currentIndex / (STAGES.length - 1)) * 100}%`,
          }}
          aria-hidden="true"
        />

        {STAGES.map((stage, i) => {
          const done = currentIndex > i || status === 'completed' && i <= currentIndex;
          const isCurrent = i === currentIndex && status !== 'completed';
          const reached = currentIndex >= i;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-2" style={{ flex: 1 }}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  reached
                    ? 'border-signal bg-signal text-white'
                    : 'border-line bg-paper text-ink-faint'
                }`}
              >
                {reached && i < currentIndex ? (
                  <Check size={15} />
                ) : isCurrent ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : i === currentIndex && status === 'completed' ? (
                  <Check size={15} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-center text-xs font-medium ${
                  reached ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'failed' && (
        <p className="mt-4 text-center text-sm font-medium text-danger">
          Processing failed. See details below.
        </p>
      )}
    </div>
  );
}
