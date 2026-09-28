import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserVideos } from "../services/api.js";
import { normalizeVideoStatus } from "../utils/videoStatus.js";
import { formatTime } from "../utils/time.js";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        setIsLoading(true);
        setError("");
        const response = await getUserVideos();
        if (!isMounted) return;

        const payload = response.data ?? {};
        const items = Array.isArray(payload)
          ? payload
          : payload.videos ?? payload.data?.videos ?? payload.items ?? payload.data?.items ?? [];

        const processedVideos = (Array.isArray(items) ? items : []).map((video) => normalizeLibraryVideo(video)).filter((video) => video.status === "ready");
        setVideos(processedVideos);
      } catch {
        if (!isMounted) return;
        setError("Unable to load your processed videos. Try again.");
        setVideos([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-8 lg:pt-14">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Library</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">My Processed Videos</h1>
      </header>

      {isLoading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 shadow-sm">
          Loading videos...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-sm">
          <p className="text-base font-semibold text-red-800">Unable to load your processed videos.</p>
          <p className="mt-2 text-sm text-red-700">Try again.</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-6 w-6"><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No processed videos yet.</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Upload and process your first video from the Dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <article key={video.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="relative flex aspect-16/9 items-center justify-center overflow-hidden bg-slate-900">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.filename} className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#172554_0%,#1d4ed8_52%,#0f172a_100%)] opacity-80" />
                )}
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5 h-5 w-5"><path d="M7 5.8c0-.8.9-1.3 1.6-.9l10 5.8a1 1 0 0 1 0 1.7l-10 5.8a1.05 1.05 0 0 1-1.6-.9V5.8Z" /></svg>
                </span>
                {video.duration > 0 && (
                  <span className="absolute bottom-2 right-2 rounded bg-slate-950/80 px-1.5 py-1 text-xs font-semibold text-white">{formatTime(video.duration)}</span>
                )}
              </div>

              <div className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="min-w-0 truncate text-base font-bold text-slate-950" title={video.filename}>{video.filename}</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Processed
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-500">
                  {video.duration > 0 && <p>Duration: {formatTime(video.duration)}</p>}
                  {video.createdAt && <p>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</p>}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <Link to={`/video/${video.id}`} state={{ videoUrl: video.videoUrl, filename: video.filename, duration: video.duration, status: video.status }} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 transition-colors hover:text-blue-900">
                    Open workspace <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function normalizeLibraryVideo(video) {
  const status = normalizeVideoStatus(video);
  const videoId = video.id ?? video._id ?? video.videoId ?? video.video_id;

  return {
    id: videoId ?? `video-${Math.random().toString(16).slice(2)}`,
    filename: video.filename ?? video.title ?? video.originalName ?? video.name ?? "Untitled video",
    duration: Number(video.duration ?? video.length ?? 0) || 0,
    thumbnail: video.thumbnail ?? video.thumbnailUrl ?? video.previewUrl ?? video.videoUrl ?? "",
    videoUrl: video.videoUrl ?? video.playbackUrl ?? video.url ?? video.streamUrl ?? "",
    status,
    createdAt: video.createdAt ?? video.uploadedAt ?? video.uploaded_at ?? video.created_at ?? null,
  };
}

export default Videos;
