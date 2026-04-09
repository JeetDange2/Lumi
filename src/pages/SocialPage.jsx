import React from "react";
import { useNavigate } from "react-router-dom";

export default function SocialPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans relative overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-pink-700 opacity-20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-rose-700 opacity-10 blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-12 py-6">
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 py-10 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">

          {/* Left Text */}
          <div className="flex-1">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-6 bg-pink-500/10 text-pink-400 border border-pink-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2 animate-pulse" />
              Community
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Learn together.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                Grow faster.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Connect with learners worldwide who share your goals. Join active study groups,
              participate in daily challenges, and get answers to your questions in minutes.
              Learning is no longer a solitary journey.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-pink-600 hover:bg-pink-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-pink-900/40">
                Join Community
              </button>
              <button className="bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95">
                Find Study Groups
              </button>
            </div>
          </div>

          {/* Right Visualizer */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-rose-400" />

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-semibold">Live Discussions</h3>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.05] px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  1,204 online
                </span>
              </div>

              <div className="space-y-4">
                {/* Message 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shrink-0 border border-white/10" />
                  <div className="bg-white/[0.04] border border-white/[0.05] rounded-2xl rounded-tl-none p-3.5 flex-1 relative group-hover:bg-white/[0.06] transition-colors">
                    <p className="text-xs text-zinc-300">Hey everyone! Anyone here studying the new React 19 compiler hooks? Would love to share notes.</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">#react</span>
                      <span className="text-[10px] text-zinc-500">2 mins ago</span>
                    </div>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0 border border-white/10" />
                  <div className="bg-pink-600/20 border border-pink-500/30 rounded-2xl rounded-tr-none p-3.5 flex-1 shadow-inner shadow-pink-900/20">
                    <p className="text-xs text-white">Yes! I just finished the tutorial on `useActionState`. Creating a study room in 10 mins if you want to join.</p>
                    <div className="flex justify-end gap-2 mt-2">
                      <span className="text-[10px] text-zinc-400">Just now</span>
                    </div>
                  </div>
                </div>

                {/* Message 3 */}
                <div className="flex gap-4 opacity-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0 border border-white/10" />
                  <div className="bg-white/[0.03] border border-white/[0.03] rounded-2xl p-3.5 flex-1">
                    <div className="h-2 w-3/4 bg-white/10 rounded mb-2 animate-pulse" />
                    <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
