import React from "react";
import { useNavigate } from "react-router-dom";

export default function PerformanceTrackerPage() {
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
      <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-700 opacity-20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-teal-700 opacity-10 blur-[130px] pointer-events-none" />

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
            <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Analytics
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Measure your.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Mastery.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Visualize your progress with real-time analytics. Identify strengths, weaknesses,
              and milestones at a glance. Our charts break down your learning patterns so you
              know exactly where to invest your energy next.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40">
                View Dashboard
              </button>
              <button className="bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95">
                Export Data
              </button>
            </div>
          </div>

          {/* Right Visualizer (Chart Mockup) */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-medium">Weekly Activity</h3>
                  <p className="text-xs text-zinc-500">+14% from last week</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  Top 5% Learner
                </div>
              </div>

              {/* Bar Chart Mockup */}
              <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-white/[0.05] relative">
                <div className="w-1/6 bg-white/[0.05] rounded-t-md h-[40%] group-hover:bg-emerald-500/20 transition-colors" />
                <div className="w-1/6 bg-emerald-500/40 rounded-t-lg h-[60%] shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:h-[65%] transition-all duration-500" />
                <div className="w-1/6 bg-white/[0.05] rounded-t-md h-[35%] group-hover:bg-emerald-500/20 transition-colors" />
                <div className="w-1/6 bg-emerald-500/80 rounded-t-xl h-[85%] shadow-[0_0_20px_rgba(16,185,129,0.5)] relative group-hover:h-[90%] transition-all duration-500">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    Peak!
                  </div>
                </div>
                <div className="w-1/6 bg-emerald-500/20 rounded-t-md h-[50%] group-hover:bg-emerald-500/30 transition-colors" />
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-zinc-600 font-medium mt-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> React
                  </span>
                  <span className="text-white font-medium">12 hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" /> Node.js
                  </span>
                  <span className="text-white font-medium">8 hrs</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
