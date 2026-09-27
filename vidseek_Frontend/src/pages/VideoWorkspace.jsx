import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { formatTime } from "../utils/time.js";
import { normalizeVideoStatus } from "../utils/videoStatus.js";
import { getVideoResults, searchPhoto, searchText } from "../services/api.js";

function VideoWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const playerRef = useRef(null);
  const playerFrameRef = useRef(null);
  const photoInputRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(location.state?.videoUrl || "");
  const [videoName, setVideoName] = useState(location.state?.filename || "Video workspace");
  const [videoDuration, setVideoDuration] = useState(Number(location.state?.duration) || 0);
  const [mode, setMode] = useState("text");
  const [query, setQuery] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [resultsLoadedFor, setResultsLoadedFor] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [analysisState, setAnalysisState] = useState(() => ({
    videoId: id,
    status: normalizeVideoStatus(location.state?.status),
  }));
  const analysisStatus = analysisState.videoId === id ? analysisState.status : normalizeVideoStatus(location.state?.status);
  const isLoadingResults = resultsLoadedFor !== id;

  useEffect(() => {
    let cancelled = false;
    let timer;
    let currentStatus = normalizeVideoStatus(location.state?.status);

    const loadResults = async () => {
      try {
        const { data } = await getVideoResults(id);
        if (cancelled) return;
        const payload = data ?? {};
        const video = payload.video ?? {};
        const nextStatus = normalizeVideoStatus(payload);
        if (nextStatus !== "unknown") currentStatus = nextStatus;
        setAnalysisState({ videoId: id, status: currentStatus });
        const source = video.playbackUrl ?? video.videoUrl ?? video.url ?? payload.videoUrl;
        if (source) setVideoUrl(source);
        if (video.filename ?? video.name) setVideoName(video.filename ?? video.name);
        if (Number(video.duration ?? payload.duration)) setVideoDuration(Number(video.duration ?? payload.duration));
        setResults(normalizeResults(payload));

        if (currentStatus === "processing") {
          timer = window.setTimeout(loadResults, 5000);
        } else {
          setResultsLoadedFor(id);
        }
      } catch (error) {
        if (cancelled) return;
        if (error.response?.status !== 404) setLoadError("Saved moments couldn't be loaded. You can still try again when video analysis is ready.");
        setResultsLoadedFor(id);
      }
    };

    loadResults();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [id, location.state?.status]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearchError("");
    if (analysisStatus !== "ready") {
      setSearchError("Search is available after video processing is complete.");
      return;
    }
    if (mode === "text" && !query.trim()) {
      setSearchError("Describe a person, scene or moment to search for.");
      return;
    }
    if (mode === "photo" && !photo) {
      setSearchError("Choose a JPG or PNG reference photo first.");
      return;
    }

    setIsSearching(true);
    try {
      const response = mode === "text"
        ? await searchText(id, query.trim())
        : await searchPhoto(id, photo);
      const nextResults = normalizeResults(response.data);
      setResults(nextResults);
      setSelectedResult(null);
      setHasSearched(true);
    } catch {
      setSearchError("Search couldn't be completed. Check that video analysis is ready, then try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setPhoto(null);
      setPhotoPreview("");
      setSearchError("Choose a JPG or PNG image.");
      event.target.value = "";
      return;
    }
    setSearchError("");
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const jumpTo = (result) => {
    setSelectedResult(result.id);
    setCurrentTime(result.timestamp);
    if (playerRef.current && videoUrl) {
      playerRef.current.currentTime = result.timestamp;
      playerRef.current.play().catch(() => {});
    }
  };

  const seekTo = (time) => {
    setCurrentTime(Number(time));
    if (playerRef.current && videoUrl) playerRef.current.currentTime = Number(time);
  };

  const togglePlayback = () => {
    if (!playerRef.current || !videoUrl) return;
    if (playerRef.current.paused) playerRef.current.play().catch(() => {});
    else playerRef.current.pause();
  };

  const handleVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (playerRef.current) playerRef.current.volume = nextVolume;
  };

  const handleFullscreen = () => {
    if (playerFrameRef.current?.requestFullscreen) playerFrameRef.current.requestFullscreen();
  };

  const duration = videoDuration || Math.max(0, ...results.map((result) => result.endTime || result.timestamp));

  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Video workspace</p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">{videoName}</h1>
          <p className="mt-1 text-sm text-slate-500">Video ID: {id}</p>
        </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            <span className={`h-1.5 w-1.5 rounded-full ${analysisStatus === "ready" ? "bg-emerald-500" : analysisStatus === "failed" ? "bg-red-500" : analysisStatus === "processing" ? "bg-amber-500" : "bg-slate-400"}`} />
            {analysisStatus === "ready" ? "Ready to search" : analysisStatus === "processing" ? "Processing video" : analysisStatus === "uploaded" ? "Uploaded · status unavailable" : analysisStatus === "failed" ? "Processing failed" : "Analysis status unavailable"}
        </span>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)]">
        <section aria-label="Video player" className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div ref={playerFrameRef} className="relative aspect-video bg-slate-950">
            {videoUrl ? (
              <video
                ref={playerRef}
                src={videoUrl}
                className="h-full w-full bg-black object-contain"
                playsInline
                onLoadedMetadata={(event) => setVideoDuration(event.currentTarget.duration)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-blue-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-7 w-7"><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
                </span>
                <h2 className="mt-4 text-base font-bold">Video preview unavailable</h2>
                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-300">The current API response doesn't include a playback URL. Search and timestamp results remain available when the analysis service returns them.</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-3 py-3 sm:px-4">
            <button type="button" onClick={togglePlayback} disabled={!videoUrl} aria-label={isPlaying ? "Pause video" : "Play video"} className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
              {isPlaying ? <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4"><path d="M6 4.5A.5.5 0 0 1 6.5 4h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11Zm6 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11Z" /></svg> : <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ml-0.5 h-4 w-4"><path d="M5.5 3.9c0-.8.9-1.3 1.6-.9l9.1 5.2a1 1 0 0 1 0 1.7l-9.1 5.2a1 1 0 0 1-1.6-.9V3.9Z" /></svg>}
            </button>
            <span className="w-20.5 font-mono text-xs tabular-nums text-slate-600">{formatTime(currentTime)} / {formatTime(duration)}</span>
            <input type="range" aria-label="Seek video" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => seekTo(event.target.value)} disabled={!videoUrl} className="h-1.5 min-w-24 flex-1 cursor-pointer accent-blue-600 disabled:cursor-not-allowed" />
            <label className="hidden items-center gap-2 sm:flex" aria-label="Volume">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 text-slate-500"><path d="M9 4.5a.75.75 0 0 1 1.28-.53l3.22 3.22h2.25A1.25 1.25 0 0 1 17 8.44v3.12a1.25 1.25 0 0 1-1.25 1.25H13.5l-3.22 3.22A.75.75 0 0 1 9 15.5v-11ZM5.53 7.47a.75.75 0 0 1 0 1.06 2.08 2.08 0 0 0 0 2.94.75.75 0 1 1-1.06 1.06 3.58 3.58 0 0 1 0-5.06.75.75 0 0 1 1.06 0Z" /></svg>
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolume} disabled={!videoUrl} className="w-16 accent-blue-600 disabled:opacity-40" />
            </label>
            <button type="button" onClick={handleFullscreen} disabled={!videoUrl} aria-label="Fullscreen" className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4"><path d="M3 3.75A.75.75 0 0 1 3.75 3h4a.75.75 0 0 1 0 1.5H4.5v3.25a.75.75 0 0 1-1.5 0v-4Zm9.25 0a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0V4.5h-3.25a.75.75 0 0 1-.75-.75ZM3.75 12a.75.75 0 0 1 .75.75V16.5h3.25a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75v-4a.75.75 0 0 1 .75-.75Zm12.5 0a.75.75 0 0 1 .75.75V16.5h-3.25a.75.75 0 0 1 0-1.5h3.25v-2.25a.75.75 0 0 1 .75-.75Z" /></svg>
            </button>
          </div>
        </section>

        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Search this video</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950">Find a moment</h2>
          </div>
          <form onSubmit={handleSearch} className="p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Search method">
              <button type="button" role="tab" aria-selected={mode === "text"} onClick={() => { setMode("text"); setSearchError(""); }} className={`min-h-9 rounded-md px-3 text-sm font-semibold transition-colors ${mode === "text" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Describe a moment</button>
              <button type="button" role="tab" aria-selected={mode === "photo"} onClick={() => { setMode("photo"); setSearchError(""); }} className={`min-h-9 rounded-md px-3 text-sm font-semibold transition-colors ${mode === "photo" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Find a person</button>
            </div>

            {mode === "text" ? (
              <label className="block">
                <span className="sr-only">Describe the moment to find</span>
                <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-600"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.44 9.79l3.27 3.27a.75.75 0 1 0 1.06-1.06l-3.27-3.27A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" /></svg>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find someone speaking at a microphone" className="min-h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0" />
                </div>
              </label>
            ) : (
              <div>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="sr-only" />
                {photoPreview ? (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <img src={photoPreview} alt="Selected reference" className="h-14 w-14 rounded-md object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{photo.name}</p><p className="text-xs text-slate-500">Reference photo ready</p></div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button type="button" onClick={() => photoInputRef.current?.click()} className="text-xs font-semibold text-blue-700 hover:text-blue-900">Change</button>
                      <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(""); if (photoInputRef.current) photoInputRef.current.value = ""; }} className="text-xs font-semibold text-slate-500 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-6 w-6 text-blue-700"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 8.5 12l3 3L17 9l3 5.5M5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 4h-13A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20Z" /><circle cx="8" cy="8" r="1.3" /></svg>
                    <span className="mt-2 text-sm font-semibold text-slate-800">Choose a reference photo</span>
                    <span className="mt-1 text-xs text-slate-500">JPG or PNG</span>
                  </button>
                )}
              </div>
            )}

            {searchError && <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{searchError}</p>}
            <button type="submit" disabled={isSearching || isLoadingResults || analysisStatus !== "ready"} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70">
              {isSearching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isSearching ? "Searching video..." : analysisStatus === "processing" ? "Processing video..." : analysisStatus === "failed" ? "Processing failed" : analysisStatus !== "ready" ? "Search unavailable" : mode === "photo" ? "Find this person" : "Search video"}
            </button>
            {loadError && <p role="status" className="mt-3 text-xs leading-5 text-amber-800">{loadError}</p>}
          </form>

          <section aria-live="polite" className="border-t border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5">
              <h3 className="text-sm font-bold text-slate-900">Moments</h3>
              {!isLoadingResults && <span className="text-xs font-medium text-slate-500">{results.length} {results.length === 1 ? "match" : "matches"}</span>}
            </div>
            <div className="max-h-105 space-y-2 overflow-y-auto px-3 pb-3 sm:px-4">
              {isLoadingResults ? <ResultSkeleton /> : results.length ? results.map((result) => (
                <SearchResult key={result.id} result={result} selected={selectedResult === result.id} onSelect={() => jumpTo(result)} />
              )) : (
                <div className="rounded-lg bg-slate-50 px-4 py-7 text-center">
                  <p className="text-sm font-semibold text-slate-800">{hasSearched ? "No matches found" : "Search to find a moment"}</p>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">{hasSearched ? "Try a different description or another reference photo." : "Describe a scene or choose a person photo to get timestamped results."}</p>
                </div>
              )}
            </div>
          </section>
        </aside>

        <section aria-label="Search result timeline" className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-bold text-slate-900">Moment timeline</h2><p className="mt-0.5 text-xs text-slate-500">Select a marker to review its timestamp</p></div>
            <span className="font-mono text-xs text-slate-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="relative flex h-9 items-center px-1">
            <div className="absolute inset-x-1 h-1 rounded-full bg-slate-200" />
            <div className="absolute left-1 h-1 rounded-full bg-blue-500" style={{ width: `${duration ? Math.min((currentTime / duration) * 100, 100) : 0}%` }} />
            {results.map((result) => {
              const position = duration ? Math.min((result.timestamp / duration) * 100, 100) : 0;
              return (
                <button key={result.id} type="button" onClick={() => jumpTo(result)} disabled={!duration} title={`${formatTime(result.timestamp)} · ${result.description}`} aria-label={`Jump to ${formatTime(result.timestamp)}: ${result.description}`} className={`group absolute z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full disabled:cursor-not-allowed`} style={{ left: `calc(${position}% + 4px)` }}>
                  <span className={`h-3 w-3 rounded-full border-2 border-white shadow transition-transform group-hover:scale-125 ${selectedResult === result.id ? "bg-blue-800 ring-2 ring-blue-300" : "bg-blue-600"}`} />
                  <span className="pointer-events-none absolute bottom-8 left-1/2 hidden w-44 -translate-x-1/2 rounded-md bg-slate-950 px-2.5 py-2 text-left text-xs text-white shadow-lg group-hover:block group-focus-visible:block"><strong className="block font-mono text-blue-200">{formatTime(result.timestamp)}</strong>{result.description}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between font-mono text-[11px] text-slate-500"><span>00:00</span><span>{formatTime(duration)}</span></div>
        </section>
      </div>
    </main>
  );
}

function SearchResult({ result, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect} className={`flex w-full gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? "border-blue-300 bg-blue-50/70" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"}`}>
      {result.thumbnail ? <img src={result.thumbnail} alt="Video frame for this result" className="h-17 w-24 shrink-0 rounded-md object-cover" /> : <span className="flex h-17 w-24 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5"><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg></span>}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-blue-800">{formatTime(result.timestamp)}{result.endTime > result.timestamp ? `–${formatTime(result.endTime)}` : ""}</span>{result.score !== null && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">{result.score}% relevant</span>}</span>
        <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{result.description}</span>
        <span className="mt-1 block text-xs text-slate-500">{result.type || "Video match"}</span>
      </span>
    </button>
  );
}

function ResultSkeleton() {
  return <div className="space-y-2" aria-label="Loading search results"><div className="h-23 animate-pulse rounded-lg bg-slate-100" /><div className="h-23 animate-pulse rounded-lg bg-slate-100" /></div>;
}

function normalizeResults(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.results ?? payload?.matches ?? payload?.data?.results ?? payload?.data?.matches ?? [];
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    const timestamp = parseTimestamp(item.timestamp ?? item.startTime ?? item.start_time ?? item.start ?? 0);
    const rawScore = item.score ?? item.similarity ?? item.confidence;
    const numericScore = Number(rawScore);
    const score = rawScore === undefined || rawScore === null || Number.isNaN(numericScore)
      ? null
      : Math.round(numericScore <= 1 ? numericScore * 100 : numericScore);
    return {
      id: item.id ?? item._id ?? `${timestamp}-${index}`,
      timestamp,
      endTime: parseTimestamp(item.endTime ?? item.end_time ?? item.end ?? timestamp),
      description: item.description ?? item.caption ?? item.text ?? item.label ?? "Matching moment",
      type: item.type ?? item.kind ?? "Video match",
      score: score === null ? null : Math.max(0, Math.min(score, 100)),
      thumbnail: item.thumbnailUrl ?? item.thumbnail_url ?? item.thumbnail ?? null,
    };
  }).sort((left, right) => left.timestamp - right.timestamp);
}

function parseTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === "string" && value.includes(":")) {
    return value.split(":").reduce((total, part) => total * 60 + (Number(part) || 0), 0);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export default VideoWorkspace;
