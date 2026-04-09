import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const mockTweets = [
  {
    id: "1",
    author: "Dan Abramov",
    handle: "@dan_abramov",
    content: "If you're learning React, remember that you don't need to memorize every hook right away. Start with useState and useEffect. Build stuff.",
    likes: "4.2k",
    comments: "128",
    time: "2h"
  },
  {
    id: "2",
    author: "100DaysOfCode",
    handle: "@_100DaysOfCode",
    content: "Day 45: Finally wrapped my head around asynchronous JavaScript and Promises! Next up: async/await and fetching APIs. #100DaysOfCode",
    likes: "856",
    comments: "45",
    time: "5h"
  },
  {
    id: "3",
    author: "FreeCodeCamp",
    handle: "@freeCodeCamp",
    content: "A free, full-length course on Data Structures and Algorithms in Python is now live on our YouTube channel. Dive in!",
    likes: "12.1k",
    comments: "502",
    time: "8h"
  }
];

export default function SocialPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMentor, setIsMentor] = useState(false);
  const [redditPosts, setRedditPosts] = useState([]);
  const [groupLinks, setGroupLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('reddit');
  
  // Form State
  const [groupTitle, setGroupTitle] = useState("");
  const [groupUrl, setGroupUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Real-time Reddit Posts
  useEffect(() => {
    let intervalId;
    const fetchReddit = async () => {
      try {
        // We use the public JSON endpoint which is part of Reddit's API.
        // Switching to 'new.json' to get the most recent posts.
        const res = await fetch("https://www.reddit.com/r/learnprogramming/new.json?limit=10");
        const data = await res.json();
        setRedditPosts(data.data.children.map(c => c.data).filter(p => !p.stickied));
      } catch (err) {
        console.error("Error fetching Reddit data:", err);
      }
    };
    
    // Initial fetch
    fetchReddit();
    
    // Poll the Reddit API every 30 seconds for a "real-time" feel
    intervalId = setInterval(fetchReddit, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Listen to Firestore Group Links
  useEffect(() => {
    const q = query(collection(db, "groupLinks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const links = [];
      snapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() });
      });
      setGroupLinks(links);
    });
    return () => unsubscribe();
  }, []);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!groupTitle || !groupUrl) return;
    setIsSubmitting(true);
    
    const newGroup = {
      id: Date.now().toString(),
      title: groupTitle,
      url: groupUrl,
      mentorName: user?.displayName || user?.email?.split('@')[0] || "Anonymous Mentor",
      mentorId: user?.uid || "unknown",
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "groupLinks"), {
        title: newGroup.title,
        url: newGroup.url,
        mentorName: newGroup.mentorName,
        mentorId: newGroup.mentorId,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Firebase write failed, failing over to local UI state: ", err);
      // Fallback if permission fails: Just add it to the state directly so the user sees it
      setGroupLinks(prev => [newGroup, ...prev]);
    }
    
    setGroupTitle("");
    setGroupUrl("");
    setIsSubmitting(false);
  };

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
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
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

        {/* Mentor Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Mentor Mode:</span>
          <button
            onClick={() => setIsMentor(!isMentor)}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isMentor ? 'bg-pink-600' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${isMentor ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 py-4 max-w-7xl mx-auto flex flex-col gap-12 pb-20">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-6 bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2 animate-pulse" />
            Social & Community
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Connect. Share.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
              Transform together.
            </span>
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Study Groups & Mentorship */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Active Study Groups</h2>
              <span className="text-xs text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                {groupLinks.length} available
              </span>
            </div>

            {/* Mentor Upload Form */}
            {isMentor && (
              <div className="bg-[#18181b]/80 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 shadow-xl shadow-pink-900/10 mb-2">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <h3 className="text-white font-medium">Add New Study Group</h3>
                </div>
                <form onSubmit={handleAddGroup} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Group Name (e.g. JS Hackers Discord)"
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder="Invite Link (https://...)"
                      value={groupUrl}
                      onChange={(e) => setGroupUrl(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200"
                  >
                    {isSubmitting ? "Broadcasting..." : "Share Group Link"}
                  </button>
                </form>
              </div>
            )}

            {/* List of Groups */}
            <div className="space-y-4">
              {groupLinks.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 text-center">
                  <p className="text-zinc-500 text-sm">No study groups available right now. Check back later!</p>
                </div>
              ) : (
                groupLinks.map((link) => (
                  <div key={link.id} className="bg-white/[0.04] border border-white/[0.08] hover:border-pink-500/30 hover:bg-white/[0.06] transition-all rounded-2xl p-5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0 border border-white/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-base mb-1">{link.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 bg-black/30 px-2 py-0.5 rounded">
                            Host: {link.mentorName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex shrink-0"
                    >
                      Join
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Community Feed */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Community Feed</h2>
              
              {/* Tabs */}
              <div className="flex bg-white/[0.05] border border-white/[0.08] rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('reddit')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'reddit' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Reddit
                </button>
                <button 
                  onClick={() => setActiveTab('twitter')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'twitter' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Twitter (X)
                </button>
              </div>
            </div>

            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeTab === 'reddit' ? 'from-orange-500 to-rose-400' : 'from-cyan-400 to-blue-500'}`} />
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'reddit' ? (
                  redditPosts.length === 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="bg-white/10 w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    redditPosts.map((post) => (
                      <a 
                        key={post.id} 
                        href={`https://reddit.com${post.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/[0.03] border border-white/10 hover:border-orange-500/30 rounded-2xl p-4 transition-all hover:bg-white/[0.05]"
                      >
                        <div className="flex gap-3 items-start mb-2">
                          <div className="flex flex-col items-center gap-1 text-zinc-500 bg-black/20 rounded-md px-2 py-1 shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                              <line x1="12" y1="19" x2="12" y2="5"></line>
                              <polyline points="5 12 12 5 19 12"></polyline>
                            </svg>
                            <span className="text-[10px] font-medium">{post.score > 999 ? (post.score/1000).toFixed(1)+'k' : post.score}</span>
                          </div>
                          <h4 className="text-sm font-medium text-white/90 leading-snug line-clamp-2">
                            {post.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 ml-12 text-[11px] text-zinc-500">
                          <span>u/{post.author}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {post.num_comments}
                          </span>
                        </div>
                      </a>
                    ))
                  )
                ) : (
                  // Twitter Tab
                  mockTweets.map((tweet) => (
                    <div 
                      key={tweet.id} 
                      className="block bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-4 transition-all hover:bg-white/[0.05]"
                    >
                      <div className="flex gap-3 items-start mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-sm font-semibold text-white">{tweet.author}</h4>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.4-1.4 2.7 2.7 6.5-6.5 1.4 1.4-7.9 7.9z"></path>
                            </svg>
                          </div>
                          <span className="text-xs text-zinc-500">{tweet.handle} · {tweet.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{tweet.content}</p>
                      <div className="flex items-center gap-6 text-zinc-500 text-[11px] font-medium">
                        <div className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          {tweet.comments}
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {tweet.likes}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
      
      {/* Scrollbar styles for the feed */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
