import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AudioDropzone from '../components/AudioDropzone';
import PipelineTracker from '../components/PipelineTracker';
import { uploadMeeting } from '../services/api';

export default function UploadMeeting() {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState(null); // null | 'uploaded' | 'transcribing' | 'summarizing' | 'completed' | 'failed'
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const isProcessing = stage && stage !== 'completed' && stage !== 'failed';

  const handleUpload = async () => {
    if (!file) return;
    setErrorMessage(null);
    setStage('uploaded');
    setUploadProgress(0);

    try {
      // Simulate the transcribing stage kicking in once the upload finishes,
      // since the backend does transcription + summarization synchronously.
      const meetingPromise = uploadMeeting(file, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setStage('transcribing');
      });

      // After a short delay, advance the UI to the summarizing stage so the
      // user has a sense of progress during the longer LLM call.
      const advanceTimer = setTimeout(() => setStage('summarizing'), 4000);

      const meeting = await meetingPromise;
      clearTimeout(advanceTimer);

      setStage('completed');
      toast.success('Meeting processed successfully');
      setTimeout(() => navigate(`/meetings/${meeting._id}`), 700);
    } catch (err) {
      setStage('failed');
      setErrorMessage(err.message);
      toast.error(err.message);
    }
  };

  const reset = () => {
    setFile(null);
    setStage(null);
    setErrorMessage(null);
    setUploadProgress(0);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Upload Meeting</h1>
      <p className="mt-1 text-sm text-ink-faint">
        We'll transcribe the audio and extract a summary, decisions, and action items.
      </p>

      <div className="mt-8 card p-6">
        <AudioDropzone
          file={file}
          onFileSelect={setFile}
          onFileRemove={reset}
          disabled={isProcessing || stage === 'completed'}
        />

        {stage && (
          <div className="mt-8">
            <PipelineTracker status={stage === 'uploaded' && uploadProgress < 100 ? 'uploaded' : stage} />
            {stage === 'uploaded' && uploadProgress < 100 && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-signal transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {stage === 'failed' && errorMessage && (
          <div className="mt-6 rounded-lg bg-dangerSoft px-4 py-3 text-sm font-medium text-danger">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {stage === 'failed' ? (
            <>
              <button onClick={handleUpload} className="btn-primary">
                Try Again
              </button>
              <button onClick={reset} className="btn-secondary">
                Choose a Different File
              </button>
            </>
          ) : stage === 'completed' ? (
            <button onClick={reset} className="btn-secondary">
              Upload Another Meeting
            </button>
          ) : (
            <button onClick={handleUpload} disabled={!file || isProcessing} className="btn-primary w-full sm:w-auto">
              {isProcessing ? 'Processing…' : 'Upload & Process'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
