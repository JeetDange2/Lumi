import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function BadgeCard({ locked, icon, title, desc, color }) {
    const colorStyles = {
        red: "from-red-500/20 border-red-500/30 text-red-200 group-hover:border-red-500/50 shadow-red-900/20",
        fuchsia: "from-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-200 group-hover:border-fuchsia-500/50 shadow-fuchsia-900/20",
        blue: "from-blue-500/20 border-blue-500/30 text-blue-200 group-hover:border-blue-500/50 shadow-blue-900/20",
        indigo: "from-indigo-500/20 border-indigo-500/30 text-indigo-200 group-hover:border-indigo-500/50 shadow-indigo-900/20",
        orange: "from-orange-500/20 border-orange-500/30 text-orange-200 group-hover:border-orange-500/50 shadow-orange-900/20",
        cyan: "from-cyan-500/20 border-cyan-500/30 text-cyan-200 group-hover:border-cyan-500/50 shadow-cyan-900/20",
    };

    if (locked) {
        return (
            <div className="bg-[#18181b]/50 border border-white/[0.05] border-dashed rounded-2xl p-5 flex flex-col items-center text-center opacity-40 grayscale">
                <div className="text-3xl mb-3 opacity-50">{icon}</div>
                <h4 className="text-sm font-bold text-zinc-400 mb-1">{title}</h4>
                <p className="text-[10px] text-zinc-600 font-medium px-2">{desc}</p>
                <div className="mt-3">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-t to-[#18181b] border rounded-2xl p-5 flex flex-col items-center text-center transition-all group hover:-translate-y-1 hover:shadow-2xl ${colorStyles[color]}`}>
            <div className="text-4xl mb-3 transform transition-transform group-hover:scale-110 group-hover:rotate-6 drop-shadow-2xl">{icon}</div>
            <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
            <p className="text-[10px] font-medium px-2 currentColor opacity-80">{desc}</p>
        </div>
    );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // RPG Logic
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [stats, setStats] = useState({ focusHours: 0, tasksCompleted: 0 });
  const [badges, setBadges] = useState({
      firstBlood: false,
      focusedMind: false,
      bookCrusher: false,
      nightOwl: false,
      earlyBird: false,
      vaultMaster: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const q = query(collection(db, "planner_events"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      const fq = query(collection(db, "flashcard_decks"), where("userId", "==", uid));
      const fSnapshot = await getDocs(fq);
      const hasDecks = !fSnapshot.empty;

      calculateStats(fetched, hasDecks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, hasDecks) => {
    let tasksCompleted = 0;
    let focusCycles = 0;
    let rawXp = 0;
    
    let isNightOwl = false;
    let isEarlyBird = false;

    data.forEach(ev => {
      // Validate Timestamp
      if (ev.createdAt) {
          const h = new Date(ev.createdAt).getHours();
          if (h >= 23 || h <= 3) isNightOwl = true;
          if (h >= 4 && h <= 6) isEarlyBird = true;
      }

      if (ev.completed) {
        if (ev.title.includes("Deep Work")) {
            focusCycles++;
            rawXp += 150; 
        } else {
            tasksCompleted++;
            rawXp += 50;
        }
      }
    });

    setBadges({
        firstBlood: tasksCompleted >= 1,
        focusedMind: focusCycles >= 5,
        bookCrusher: tasksCompleted >= 20,
        nightOwl: isNightOwl,
        earlyBird: isEarlyBird,
        vaultMaster: hasDecks
    });

    // Simple Leveling Curve
    let currentLevel = 1;
    let requiredXp = 200;
    let tempXp = rawXp;

    while (tempXp >= requiredXp) {
        tempXp -= requiredXp;
        currentLevel++;
        requiredXp = Math.floor(requiredXp * 1.5);
    }

    setXp(tempXp);
    setLevel(currentLevel);
    setNextLevelXp(requiredXp);
    
    setStats({
        focusHours: (focusCycles * 25) / 60, // 25 min Pomodoro
        tasksCompleted: tasksCompleted
    });
  };

  const RANKS = [
    { level: 1, title: "Novice Scholar", color: "text-zinc-400" },
    { level: 5, title: "Adept Learner", color: "text-blue-400" },
    { level: 10, title: "Focus Master", color: "text-fuchsia-400" },
    { level: 20, title: "Grandmaster", color: "text-emerald-400" },
  ];

  const getCurrentRankTitle = () => {
      let title = RANKS[0].title;
      let color = RANKS[0].color;
      for(let r of RANKS) {
          if (level >= r.level) {
              title = r.title;
              color = r.color;
          }
      }
      return { title, color };
  };

  const rank = getCurrentRankTitle();

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans relative overflow-hidden pb-20 custom-scrollbar">
      {/* Background Aesthetics */}
      <div className="fixed inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-fuchsia-700/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-700/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button onClick={() => navigate("/home")} className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </div>
          <span className="text-sm font-medium">Back</span>
        </button>
        <button onClick={() => navigate("/leaderboard")} className="bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-white border border-fuchsia-500/30 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-fuchsia-900/20 flex items-center gap-2">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
           Enter Global Arena
        </button>
      </nav>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div></div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center h-[60vh] relative z-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
            <p className="text-zinc-400 mb-6 max-w-sm">You need an account to track your RPG progression and XP.</p>
            <button onClick={() => navigate("/")} className="bg-white text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:bg-zinc-200">Authenticate</button>
        </div>
      ) : (
        <main className="relative z-10 max-w-4xl mx-auto px-6 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Player Card Heading */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 p-1 shadow-2xl shadow-fuchsia-500/20">
                    <div className="w-full h-full bg-[#18181b] rounded-full flex items-center justify-center border-4 border-[#0f0f11] text-4xl font-black text-white">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left mt-2">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2 truncate">{user.email.split('@')[0]}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                        <span className={`inline-flex px-3 py-1 bg-white/[0.05] border border-white/[0.1] rounded-full text-xs font-bold tracking-widest uppercase ${rank.color}`}>
                           {rank.title}
                        </span>
                        <span className="text-zinc-500 text-sm font-medium">Joined Arena</span>
                    </div>
                </div>
            </div>

            {/* Leveling System UI */}
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium tracking-wide uppercase mb-1">Current Level</p>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Lv. {level}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-fuchsia-400">{Math.floor(xp)}</span>
                        <span className="text-zinc-500 font-medium"> / {nextLevelXp} XP</span>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/[0.05] relative z-10 shadow-inner">
                    <div 
                       className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 transition-all duration-1000 ease-out relative"
                       style={{ width: `${(xp / nextLevelXp) * 100}%` }}
                    >
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 mt-4 font-medium relative z-10">Earn XP by completing tasks and focusing in the Study Planner.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-900/10">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Tasks Crushed</p>
                    <h3 className="text-3xl font-bold text-white">{stats.tasksCompleted}</h3>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-lg shadow-emerald-900/10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Focus Time (Hrs)</p>
                    <h3 className="text-3xl font-bold text-white">{stats.focusHours.toFixed(1)}</h3>
                </div>
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl p-6 shadow-lg shadow-fuchsia-900/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-all" />
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-4 relative z-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1 relative z-10">Global Rank</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">#{Math.max(1, 1500 - (level * 40 + stats.tasksCompleted * 5))}</h3>
                </div>
            </div>

            {/* The Trophy Case */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-6 ml-2 flex items-center gap-2">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0z"></path></svg>
                    Trophy Case
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <BadgeCard locked={!badges.firstBlood} icon="🩸" title="First Blood" desc="Complete your very first task." color="red" />
                    <BadgeCard locked={!badges.focusedMind} icon="🧠" title="Focused Mind" desc="Survive 5 Pomodoro sessions." color="fuchsia" />
                    <BadgeCard locked={!badges.bookCrusher} icon="📚" title="Book Crusher" desc="Crush 20 planner tasks." color="blue" />
                    <BadgeCard locked={!badges.nightOwl} icon="⚡" title="Night Owl" desc="Study after 11 PM." color="indigo" />
                    <BadgeCard locked={!badges.earlyBird} icon="🌅" title="Early Bird" desc="Start a session before 6 AM." color="orange" />
                    <BadgeCard locked={!badges.vaultMaster} icon="🃏" title="Vault Master" desc="Craft a Flashcard Deck." color="cyan" />
                </div>
            </div>

        </main>
      )}
    </div>
  );
}
