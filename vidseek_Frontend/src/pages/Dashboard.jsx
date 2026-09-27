import { useState } from "react";
import { Link } from "react-router-dom";
import { formatTime } from "../utils/time.js";
import { normalizeVideoStatus } from "../utils/videoStatus.js";
import VideoUpload from "../components/VideoUpload.jsx";

function Dashboard() {
  const [recentVideos, setRecentVideos] = useState([]);

  const handleUploadSuccess = (newVideo) => {
    setRecentVideos((videos) => {
      const existingIndex = videos.findIndex((video) => video.id === newVideo.id);
      if (existingIndex === -1) return [newVideo, ...videos];
      return videos.map((video) => video.id === newVideo.id ? { ...video, ...newVideo } : video);
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-8 lg:pt-14">
      <section className="relative mb-9 overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] border-l border-slate-100 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_100%)] lg:block" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> AI video search
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl">
            Upload a video.<br className="hidden sm:block" /> Find the exact moment.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Search people, scenes and conversations in natural language, then jump straight to the timestamp.
          </p>
          <a href="#video-upload" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-offset-2">
            Upload a video
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4"><path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.44L10.22 5.28a.75.75 0 1 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" /></svg>
          </a>
        </div>
        <div className="relative mt-8 grid max-w-3xl grid-cols-1 gap-2 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3 lg:mt-10">
          <WorkflowStep number="01" title="Upload" description="Add an MP4 video" />
          <WorkflowStep number="02" title="Analyze" description="Build a searchable index" />
          <WorkflowStep number="03" title="Find" description="Jump to the right moment" />
        </div>
        <div className="pointer-events-none absolute right-8 top-1/2 hidden w-[31%] max-w-90 -translate-y-1/2 lg:block" aria-label="Illustrative search preview">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/10">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Illustrative preview</span>
              <span className="rounded bg-blue-50 px-1.5 py-1 text-[10px] font-bold text-blue-800">EXAMPLE</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-700"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.44 9.79l3.27 3.27a.75.75 0 1 0 1.06-1.06l-3.27-3.27A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" /></svg>
              <span className="truncate text-xs font-medium text-slate-700">Someone speaking on stage</span>
            </div>
            <div className="mt-3 flex gap-3">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-linear-to-br from-slate-700 via-blue-800 to-slate-950">
                <div className="absolute bottom-0 left-1/2 h-10 w-7 -translate-x-1/2 rounded-t-full bg-slate-950/80" />
                <div className="absolute bottom-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80" />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-bold text-slate-900">Example moment</span><span className="font-mono text-[10px] font-bold text-blue-800">01:35</span></div>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">Jump to a matching timestamp</p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[34%] rounded-full bg-blue-600" /></div>
              </div>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-500">Sample UI only · results come from your connected backend</p>
          </div>
        </div>
      </section>

      <section id="video-upload" className="scroll-mt-24 mb-14">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Start here</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Add a video to search</h2>
          </div>
          <span className="hidden text-xs font-medium text-slate-500 sm:block">MP4 · 1–10 minutes</span>
        </div>
        <VideoUpload onUploadSuccess={handleUploadSuccess} />
      </section>

      <section id="videos" className="scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Recent uploads</h2>
            <p className="mt-1 text-sm text-slate-600">Uploads from this session. Existing-library sync is not available yet.</p>
          </div>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">{recentVideos.length} in this session</span>
        </div>

        {recentVideos.length === 0 ? (
          <div className="flex flex-col items-center border-y border-slate-200 bg-white px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-6 w-6"><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
            </span>
            <h3 className="mt-4 text-base font-bold text-slate-900">Your workspace is ready</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">Upload your first video to start building a searchable timeline. Completed uploads will appear here during this session.</p>
            <a href="#video-upload" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">Choose a video</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative flex aspect-16/7 items-center justify-center overflow-hidden bg-slate-900">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#172554_0%,#1d4ed8_52%,#0f172a_100%)] opacity-80" />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5 h-5 w-5"><path d="M7 5.8c0-.8.9-1.3 1.6-.9l10 5.8a1 1 0 0 1 0 1.7l-10 5.8a1.05 1.05 0 0 1-1.6-.9V5.8Z" /></svg>
                  </span>
                  <span className="absolute left-3 top-2 rounded bg-slate-950/70 px-1.5 py-1 text-[10px] font-semibold text-white">Preview unavailable</span>
                  <span className="absolute bottom-2 right-2 rounded bg-slate-950/80 px-1.5 py-1 text-xs font-semibold text-white">{formatTime(video.duration)}</span>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate text-sm font-bold text-slate-950" title={video.filename}>{video.filename}</h3>
                    <StatusBadge status={video.status} />
                  </div>
                  <p className="text-xs text-slate-500">Uploaded in this session</p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <Link to={`/video/${video.id}`} state={{ videoUrl: video.videoUrl, filename: video.filename, duration: video.duration, status: video.status }} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 transition-colors hover:text-blue-900">
                      Open workspace <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-mono text-xs font-bold text-blue-700">{number}</span>
      <div><p className="font-bold text-slate-900">{title}</p><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = normalizeVideoStatus(status);
  if (normalizedStatus === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-600/20 px-2.5 py-1 rounded-md shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        Ready
      </span>
    );
  }

  if (normalizedStatus === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-600/20 px-2.5 py-1 rounded-md shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 animate-spin">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Processing
      </span>
    );
  }

  if (normalizedStatus === "uploaded") {
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 ring-1 ring-inset ring-slate-500/20 px-2.5 py-1 rounded-md shadow-sm">Uploaded</span>;
  }

  if (normalizedStatus === "failed") {
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 ring-1 ring-inset ring-red-600/20 px-2.5 py-1 rounded-md shadow-sm">Failed</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 ring-1 ring-inset ring-slate-500/20 px-2.5 py-1 rounded-md shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
      Pending
    </span>
  );
}

export default Dashboard;
