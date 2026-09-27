function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
      {/* Page heading */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-950 mb-4 tracking-tight">
          Search inside your videos.
        </h1>
        <p className="text-base leading-7 text-slate-600 max-w-2xl mx-auto">
          VidSeek AI finds people, scenes and spoken moments, then takes you directly to the timestamp.
        </p>
      </div>

      <div className="space-y-16">
        {/* ---- What is VidSeek AI? ---- */}
        <section className="bg-white rounded-lg border border-slate-200 p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            The Concept
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
            <p>
              VidSeek AI is a multimodal video search application that allows you to
              search inside short videos using natural language or reference photographs.
            </p>
            <p>
              Instead of watching a full video to find a specific moment, you can
              simply describe what you are looking for — or upload a photo of a
              person — and VidSeek AI will find the relevant timestamps for you instantly.
            </p>
          </div>
        </section>

        {/* ---- How it works ---- */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight px-2">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <StepCard number="1" title="Upload" desc="Select MP4 video (1–10m)" />
            <StepCard number="2" title="Process" desc="AI extracts frames & audio" />
            <StepCard number="3" title="Search" desc="Text query or photo" />
            <StepCard number="4" title="Results" desc="Browse ranked matches" />
            <StepCard number="5" title="Watch" desc="Jump to exact timestamp" />
          </div>
        </section>

        {/* ---- Search Methods ---- */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight px-2">
            Search Methods
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Natural-Language</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Describe what you want to find in plain English. For example: "Rahul receiving a certificate" or "person giving a speech".
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Reference-Photo</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload a photograph of a person and VidSeek AI will find their possible appearances throughout the video.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Technologies ---- */}
        <section className="bg-slate-900 rounded-lg p-7 sm:p-10 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-2xl font-bold mb-8 tracking-tight relative z-10">
            Powered By
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 relative z-10">
            {[
              { name: "React", desc: "Product interface" },
              { name: "Node.js", desc: "Application API" },
              { name: "Python", desc: "Video analysis" },
              { name: "OpenCV", desc: "Frame processing" },
              { name: "InsightFace", desc: "Person matching" },
              { name: "SigLIP", desc: "Visual embeddings" },
              { name: "Whisper", desc: "Speech transcription" },
            ].map((tech) => (
              <div key={tech.name}>
                <div className="text-blue-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg">{tech.name}</h4>
                <p className="text-slate-400 text-sm mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-sm transition-all">
      <div className="text-5xl font-black text-slate-50 absolute -top-2 -right-2 group-hover:text-blue-50 transition-colors z-0">
        {number}
      </div>
      <div className="relative z-10">
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}

export default About;
