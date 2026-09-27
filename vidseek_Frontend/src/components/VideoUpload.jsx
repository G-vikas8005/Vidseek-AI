import { useState, useRef, useEffect } from "react";
import { formatTime } from "../utils/time";
import { normalizeVideoStatus } from "../utils/videoStatus.js";
import { processVideo, uploadVideo } from "../services/api.js";

function VideoUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStartingProcessing, setIsStartingProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("selected");
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const fileInputRef = useRef(null);
  const validationIdRef = useRef(0);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // ---- Drag and Drop Handlers ----
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // ---- File Validation & Processing ----
  const handleFile = (file) => {
    setError(null);
    validationIdRef.current += 1;
    setSelectedFile(null);
    setPreviewUrl(null);
    setDuration(null);
    setUploadedVideo(null);
    setUploadStatus("selected");
    setUploadProgress(null);
    setIsValidating(false);

    if (file.type !== "video/mp4") {
      setError("Please upload an MP4 video.");
      return;
    }

    const url = URL.createObjectURL(file);
    const validationId = validationIdRef.current;
    const video = document.createElement("video");
    video.preload = "metadata";
    setSelectedFile(file);
    setPreviewUrl(url);
    setIsValidating(true);

    video.onloadedmetadata = () => {
      if (validationId !== validationIdRef.current) return;
      const durationSeconds = video.duration;

      if (!Number.isFinite(durationSeconds) || durationSeconds < 60 || durationSeconds > 600) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsValidating(false);
        setError("Please upload an MP4 video between 1 and 10 minutes.");
        return;
      }

      setDuration(durationSeconds);
      setIsValidating(false);
    };

    video.onerror = () => {
      if (validationId !== validationIdRef.current) return;
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsValidating(false);
      setError("Failed to load video file. It might be corrupted.");
    };

    video.src = url;
  };

  const handleRemove = () => {
    validationIdRef.current += 1;
    setSelectedFile(null);
    setDuration(null);
    setError(null);
    setPreviewUrl(null);
    setUploadedVideo(null);
    setUploadStatus("selected");
    setUploadProgress(null);
    setIsValidating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcess = async () => {
    if (!selectedFile || isValidating || isUploading || isStartingProcessing || uploadStatus === "ready") return;
    setError(null);
    setUploadProgress(null);
    let videoRecord = uploadedVideo;

    try {
      if (!videoRecord) {
        setIsUploading(true);
        setUploadStatus("uploading");
        const uploadResponse = await uploadVideo(selectedFile, {
          onUploadProgress: (event) => {
            if (event.total) setUploadProgress(Math.round((event.loaded / event.total) * 100));
          },
        });
        const responseData = uploadResponse.data;
        const video = responseData?.video ?? responseData;
        const videoId = video?.id ?? video?._id ?? responseData?.videoId;
        if (!videoId) throw new Error("missing-video-id");

        videoRecord = {
          id: videoId,
          filename: video?.filename ?? video?.originalName ?? selectedFile.name,
          duration: video?.duration ?? duration,
          videoUrl: video?.playbackUrl ?? video?.videoUrl ?? video?.url ?? video?.streamUrl ?? "",
          status: normalizeVideoStatus(responseData) === "unknown" ? "uploaded" : normalizeVideoStatus(responseData),
        };
        setUploadedVideo(videoRecord);
        setUploadStatus(videoRecord.status);
        onUploadSuccess?.(videoRecord);
      }

      setIsUploading(false);
      setIsStartingProcessing(true);
      const processResponse = await processVideo(videoRecord.id);
      const processStatus = normalizeVideoStatus(processResponse.data);
      const nextStatus = processStatus === "unknown" ? videoRecord.status : processStatus;
      videoRecord = { ...videoRecord, status: nextStatus };
      setUploadedVideo(videoRecord);
      setUploadStatus(nextStatus);
      onUploadSuccess?.(videoRecord);
      if (nextStatus === "failed") setError("The backend reported that video processing failed.");
    } catch (uploadError) {
      const status = uploadError.response?.status;
      if (videoRecord) {
        setUploadedVideo(videoRecord);
        setUploadStatus(videoRecord.status);
        setError("The video was uploaded, but processing could not be started. Try again.");
      } else if (status === 413) {
        setUploadStatus("failed");
        setError("This file is too large for the server to accept. Choose a smaller MP4 and try again.");
      } else if (uploadError.message === "missing-video-id") {
        setUploadStatus("failed");
        setError("The server accepted the upload but did not return a video ID, so analysis could not start.");
      } else {
        setUploadStatus("failed");
        setError("We couldn't upload and start analyzing this video. Check your connection and try again.");
      }
    } finally {
      setIsUploading(false);
      setIsStartingProcessing(false);
    }
  };

  const isWorking = isUploading || isStartingProcessing;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-1 max-w-2xl mx-auto group">
      
      {/* State 1: Video Selected (Preview Mode) */}
      {selectedFile && previewUrl ? (
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Video selected
            </h2>
            <button
              onClick={handleRemove}
              disabled={isWorking}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video mb-4 ring-1 ring-slate-900/10">
            <video 
              src={previewUrl} 
              controls 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 ring-1 ring-inset ring-slate-900/5">
            <p className="font-medium text-slate-900 truncate" title={selectedFile.name}>
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {duration === null ? "Checking duration" : `Duration: ${formatTime(duration)}`} · {formatFileSize(selectedFile.size)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Status: {formatUploadStatus(uploadStatus, isValidating)}</p>
          </div>

          <button
            onClick={handleProcess}
            disabled={isWorking || isValidating || uploadStatus === "ready" || uploadStatus === "processing"}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-lg font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isWorking ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isUploading ? `Uploading video${uploadProgress === null ? "..." : `... ${uploadProgress}%`}` : "Starting video analysis..."}
              </>
            ) : (
              uploadStatus === "ready" ? "Processing complete" : uploadedVideo ? "Start processing" : "Process Video"
            )}
          </button>
          {isUploading && uploadProgress !== null && (
            <div className="mt-4" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">Uploading securely</p>
            </div>
          )}
          {isStartingProcessing && <p className="mt-3 text-center text-xs text-slate-500" aria-live="polite">Starting video processing</p>}
          {error && <UploadError error={error} />}
        </div>
      ) : (
        /* State 2: No File Selected (Upload Mode) */
        <div 
          className={`border-2 border-dashed rounded-xl p-10 sm:p-12 text-center transition-colors duration-300 ${
            dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/50 group-hover:bg-slate-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`mx-auto w-16 h-16 mb-5 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-slate-900/5 transition-colors ${dragActive ? 'text-blue-600 ring-blue-500/20' : 'text-slate-400 group-hover:text-blue-500'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Drop your video here
          </h2>
          <div className="text-sm text-slate-500 mb-6 space-y-1">
            <p>MP4 video · 1–10 minutes</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            onChange={handleChange}
            className="hidden"
          />

          <button 
            onClick={onButtonClick}
            disabled={isWorking}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all mb-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Choose Video
          </button>
          
          <p className="text-xs text-slate-400">or drag and drop it here</p>

          {/* Error Message Display */}
          {error && <UploadError error={error} />}
        </div>
      )}
    </div>
  );
}

function UploadError({ error }) {
  return (
    <div role="alert" className="mt-6 p-3 bg-red-50 ring-1 ring-inset ring-red-600/20 rounded-lg flex items-start gap-3 text-left">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <div>
        <h4 className="text-sm font-semibold text-red-800">Upload issue</h4>
        <p className="text-sm text-red-700 mt-0.5">{error}</p>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadStatus(status, isValidating) {
  if (isValidating) return "Checking video";
  if (status === "ready") return "Ready";
  if (status === "processing") return "Processing";
  if (status === "uploaded") return "Uploaded; processing status unavailable";
  if (status === "uploading") return "Uploading";
  if (status === "failed") return "Failed";
  return "Selected";
}

export default VideoUpload;
