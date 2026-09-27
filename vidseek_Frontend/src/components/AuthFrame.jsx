function AuthFrame({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-68px)] w-full max-w-7xl grid-cols-1 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:px-12 lg:py-12">
      <section className="relative hidden min-h-145 overflow-hidden rounded-xl bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle at 82% 18%, rgba(59,130,246,.55), transparent 28%), linear-gradient(135deg, transparent 50%, rgba(15,23,42,.4))" }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-600">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <rect x="3" y="5" width="13" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 10 5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="9.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="text-base font-bold">VidSeek <span className="text-blue-300">AI</span></span>
          </div>
          <p className="mt-16 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Video intelligence, made searchable</p>
          <h1 className="mt-4 max-w-lg text-4xl font-bold leading-tight">Find the moment.<br />Skip the scrubbing.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300">Search people, scenes and spoken moments across your videos, then jump straight to the timestamp.</p>
        </div>

        <div className="relative rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/20 text-blue-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4"><circle cx="10.8" cy="10.8" r="6.8" /><path strokeLinecap="round" d="m16 16 4.5 4.5" /></svg>
            </span>
            <span className="text-sm text-slate-200">"Find the speaker at the microphone"</span>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-linear-to-br from-indigo-500 via-blue-700 to-slate-800">
              <div className="absolute bottom-0 left-1/2 h-9 w-7 -translate-x-1/2 rounded-t-full bg-slate-950/80" />
              <div className="absolute bottom-1 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">Speaker on stage</span><span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[11px] font-bold text-blue-200">01:35</span></div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[34%] rounded-full bg-blue-400" /></div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />A relevant moment, ready to review</div>
        </div>
      </section>

      <section className="flex min-h-130 items-center justify-center py-4 lg:min-h-0 lg:py-10">
        <div className="w-full max-w-110">
          <div className="mb-7 lg:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">VidSeek AI</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </div>
  );
}

export default AuthFrame;