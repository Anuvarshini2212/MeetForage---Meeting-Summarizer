export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
  'video/mp4',
];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export function validateAudioFile(file) {
  if (!file) return 'No file selected.';
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'File is too large. Maximum size is 50MB.';

  const nameExt = file.name.split('.').pop()?.toLowerCase();
  const validExts = ['mp3', 'wav', 'm4a', 'mp4', 'webm'];
  const typeOk = ACCEPTED_AUDIO_TYPES.includes(file.type);
  const extOk = validExts.includes(nameExt);

  if (!typeOk && !extOk) {
    return 'Unsupported file type. Please upload MP3, WAV, M4A, MP4, or WebM audio.';
  }
  return null;
}

export function statusLabel(status) {
  const map = {
    uploaded: 'Uploaded',
    transcribing: 'Transcribing',
    summarizing: 'Analyzing',
    completed: 'Completed',
    failed: 'Failed',
  };
  return map[status] || status;
}
