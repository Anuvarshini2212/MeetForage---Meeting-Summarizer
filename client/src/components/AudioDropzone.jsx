import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import { formatFileSize, validateAudioFile } from '../utils/format';

export default function AudioDropzone({ file, onFileSelect, onFileRemove, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const selected = fileList?.[0];
      if (!selected) return;

      const validationError = validateAudioFile(selected);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(selected);
    },
    [onFileSelect]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  if (file) {
    return (
      <div className="card flex items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-signal-soft text-signal-dark">
            <FileAudio size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
            <p className="text-xs text-ink-faint">{formatFileSize(file.size)}</p>
          </div>
        </div>
        {!disabled && (
          <button
            onClick={onFileRemove}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-dangerSoft hover:text-danger"
            aria-label="Remove selected file"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragActive ? 'border-signal bg-signal-soft' : 'border-line bg-white hover:border-signal/50'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-signal">
          <UploadCloud size={22} />
        </div>
        <div>
          <p className="font-medium text-ink">
            <span className="text-signal-dark">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-ink-faint">MP3, WAV, M4A, MP4, or WebM — up to 50MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.mp4,.webm"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
