import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function PerformanceTrackerPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  
  const [showDashboard, setShowDashboard] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchLogs(currentUser.uid);
      } else {
        setLogs([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLogs = async (uid) => {
    try {
      const q = query(collection(db, "planner_events"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetchedLogs = [];
      querySnapshot.forEach((docSnap) => {
        fetchedLogs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLogs(fetchedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = () => {
    setShowDashboard(true);
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Trailing Date Math
  const getTrailingDays = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const result = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for(let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime());
        d.setDate(d.getDate() - i);
        const offset = d.getTimezoneOffset();
        const dStr = new Date(d.getTime() - (offset * 60 * 1000)).toISOString().split("T")[0];
        result.push({
            date: dStr,
            name: i === 0 ? "Today" : dayNames[d.getDay()]
        });
    }
    return result;
  };

  const trailingDays = getTrailingDays();
  
  // Aggregate daily sum limits
  const completedTasks = logs.filter(log => log.completed === true);
  const tasksPerDay = {};
  trailingDays.forEach(d => { tasksPerDay[d.date] = 0; });
  let maxTasks = 0; 

  completedTasks.forEach(log => {
      if(tasksPerDay[log.date] !== undefined) {
          tasksPerDay[log.date] += 1;
      }
  });

  const chartData = trailingDays.map(d => {
      const c = tasksPerDay[d.date];
      if(c > maxTasks) maxTasks = c;
      return { ...d, count: c };
  });

  // Calculate subject breakdown for the trail
  const typeTotals = {};
  let totalCompleted = 0;

  completedTasks.forEach(log => {
      if (tasksPerDay[log.date] !== undefined) {
        typeTotals[log.type] = (typeTotals[log.type] || 0) + 1;
        totalCompleted += 1;
      }
  });
  
  const sortedTypes = Object.entries(typeTotals).sort((a,b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans relative overflow-x-hidden pb-12 custom-scrollbar">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-700 opacity-20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-teal-700 opacity-10 blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
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
        {!user && !loading && (
          <span className="text-sm text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/20 shadow-lg shadow-pink-900/20">
            Sign in to view real-time data
          </span>
        )}
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 px-6 md:px-12 py-10 max-w-5xl mx-auto mb-10">
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
              Visualize your progress with real-time analytics mapped natively from your Study Planner.
              We instantly pull data based on tasks you check off, showing exactly what topics you mastered this week.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleOpenDashboard}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-900/40"
              >
                View Dashboard
              </button>
              <button className="bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95">
                Export Data
              </button>
            </div>
          </div>

          {/* Right Visualizer (Static Mockup for Hero) */}
          <div className="flex-1 w-full max-w-md pointer-events-none opacity-50 blur-[2px] md:opacity-100 md:blur-none transition-all">
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-medium">Weekly Activity</h3>
                  <p className="text-xs text-zinc-500">Live preview</p>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  Top 5% Learner
                </div>
              </div>

              {/* Bar Chart Mockup */}
              <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-white/[0.05] relative">
                <div className="w-1/6 bg-white/[0.05] rounded-t-md h-[40%]" />
                <div className="w-1/6 bg-emerald-500/40 rounded-t-lg h-[60%] shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                <div className="w-1/6 bg-white/[0.05] rounded-t-md h-[35%]" />
                <div className="w-1/6 bg-emerald-500/80 rounded-t-xl h-[85%] shadow-[0_0_20px_rgba(16,185,129,0.5)] relative"></div>
                <div className="w-1/6 bg-emerald-500/20 rounded-t-md h-[50%]" />
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-zinc-600 font-medium mt-3">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden/Revealed Dashboard Section */}
      {showDashboard && (
        <section ref={dashboardRef} className="relative z-10 px-6 md:px-12 pb-20 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-10 duration-500 pt-10 border-t border-white/[0.05]">
          
          {/* Left Panel: Insights Panel */}
          <div className="lg:w-1/3">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Automated Insights</h2>
              <p className="text-sm text-zinc-400 mb-8">Data synced live from your Study Planner.</p>
              
              <div className="bg-[#18181b]/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-5">
                
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Total Quests Done</h3>
                        <p className="text-3xl font-bold text-white leading-none">{totalCompleted}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">High-Score Day</h3>
                        <p className="text-xl font-bold text-emerald-400 leading-none">
                            {maxTasks > 0 ? chartData.find(d => d.count === maxTasks)?.name : "—"}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20 text-teal-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                </div>

              </div>
          </div>

          {/* Right Panel: Functional Analytics Chart */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold tracking-tight text-transparent mb-2 select-none pointer-events-none">_</h2>
            <p className="text-sm text-zinc-400 mb-8">Trailing 7 days completion analysis.</p>

            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-white font-medium text-lg">Weekly Task Completions</h3>
                  <p className="text-sm text-zinc-500 mt-1">{totalCompleted} Total Completed Tasks</p>
                </div>
                {totalCompleted > 5 && (
                    <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-inner">
                    Momentum Built 🔥
                    </div>
                )}
              </div>

              {/* Functional Dynamic Bar Chart */}
              <div className="flex justify-between items-end gap-1.5 md:gap-3 h-52 pt-4 border-b border-white/[0.1] relative">
                {/* Y-Axis scale marks */}
                <div className="absolute left-0 bottom-0 top-0 w-full flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-white/[0.03] w-full mt-4"></div>
                    <div className="border-t border-white/[0.03] w-full"></div>
                    <div className="border-t border-white/[0.03] w-full"></div>
                </div>

                {chartData.map((dataObj, index) => {
                    const heightPercent = maxTasks === 0 ? 0 : Math.max(10, (dataObj.count / maxTasks) * 95);
                    const isZero = dataObj.count === 0;
                    const finalH = isZero ? 5 : heightPercent; // 5% for empty days
                    const isPeak = dataObj.count === maxTasks && maxTasks > 0;

                    return (
                        <div key={index} className="w-1/7 flex-1 flex justify-center group/bar relative h-full items-end pb-px">
                            <div 
                                style={{ height: `${finalH}%` }}
                                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out relative
                                ${isZero ? 'bg-white/[0.03]' : isPeak ? 'bg-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-emerald-500/30'}
                                hover:bg-emerald-400/60
                                `}
                            >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#27272a] border border-white/[0.1] text-white text-[10px] font-medium px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                                    {dataObj.count} tasks
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] md:text-xs text-zinc-500 font-medium mt-4 px-2">
                 {chartData.map((d, i) => <span key={i} className="flex-1 text-center truncate">{d.name}</span>)}
              </div>

              {/* Subject Breakdown Aggregation Area */}
              {sortedTypes.length > 0 ? (
                <div className="mt-10 pt-8 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedTypes.slice(0, 4).map(([typeStr, total], idx) => {
                      const colors = ["bg-cyan-500", "bg-emerald-400", "bg-fuchsia-500", "bg-violet-500"];
                      const c = colors[idx % colors.length];
                      return (
                          <div key={typeStr} className="flex items-center justify-between text-sm bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                          <span className="text-zinc-300 flex items-center gap-2.5 font-medium">
                              <span className={`w-2.5 h-2.5 rounded-full ${c} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} /> 
                              {typeStr}
                          </span>
                          <span className="text-white font-bold bg-white/[0.05] px-2 py-0.5 rounded-md">{total} quests</span>
                          </div>
                      );
                  })}
                </div>
              ) : (
                <div className="mt-10 pt-8 border-t border-white/[0.05] text-center text-zinc-500 text-sm">
                    No tasks marked complete for this week.
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
