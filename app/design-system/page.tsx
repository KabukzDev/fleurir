"use client";

import { useState } from "react";
import Link from "next/link";

export default function DesignSystemPage() {
  // Interactive Hero focal thread state
  const [upvotes, setUpvotes] = useState(42);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isAccepted, setIsAccepted] = useState(true);

  // Bento Tile 4: Active community selection
  const [selectedCommunity, setSelectedCommunity] = useState<"french" | "german" | "japanese" | "spanish">("french");

  // Bento Tile 1: League progress state
  const [currentLeaguePoints, setCurrentLeaguePoints] = useState(845);

  const communitiesData = {
    french: {
      name: "French",
      symbol: "🇫🇷",
      members: 1420,
      posts: 384,
      tag: "Grammar & Pronunciation",
      description: "Explore nuanced French idioms, subjunctive mastery, and daily conversational nuance.",
    },
    german: {
      name: "German",
      symbol: "🇩🇪",
      members: 980,
      posts: 215,
      tag: "Cases & Compound Words",
      description: "Dissect German syntax, declensions, and vocabulary with dedicated native peers.",
    },
    japanese: {
      name: "Japanese",
      symbol: "🇯🇵",
      members: 2100,
      posts: 640,
      tag: "Kanji & Keigo",
      description: "Master daily Kanji radicals, reading contexts, and natural polite sentence flow.",
    },
    spanish: {
      name: "Spanish",
      symbol: "🇪🇸",
      members: 1890,
      posts: 512,
      tag: "Ser vs Estar",
      description: "Practice regional idioms, subjunctive usages, and fluid Latin dialogue.",
    },
  };

  const handleToggleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const activeCommunity = communitiesData[selectedCommunity];

  // Radial progress calculations for Diamond League
  const maxPoints = 1000;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, currentLeaguePoints / maxPoints);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-x-hidden selection:bg-[var(--primary)] selection:text-white">
      
      {/* Background Ambient Aura Gradients (Apple Style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20"
          style={{ background: "radial-gradient(circle, #0463CA 0%, #38BDF8 60%, transparent 100%)" }}
        />
        <div 
          className="absolute top-[800px] -left-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-10"
          style={{ background: "radial-gradient(circle, #0463CA 0%, transparent 70%)" }}
        />
        <div 
          className="absolute top-[1400px] -right-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-10"
          style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)" }}
        />
      </div>

      {/* 1. FLOATING GLASSMORPHIC PILL NAV */}
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between gap-6 px-6 py-2.5 rounded-full border border-white/10 bg-[var(--bg-surface)]/75 backdrop-blur-xl shadow-2xl shadow-black/50 max-w-4xl w-full transition-all duration-300">
          <div className="flex items-center gap-3">
            <img src="/fleurir/logo_x1.png" alt="Fleurir" className="h-7 w-auto" />
            <span className="font-medium text-lg tracking-tight font-heading">Fleurir</span>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--accent)] border border-[var(--primary)]/30">
              Design System
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
            <a href="#hero" className="hover:text-[var(--text-primary)] transition-colors">Hero</a>
            <a href="#bento" className="hover:text-[var(--text-primary)] transition-colors">Bento Grid</a>
            <a href="#tokens" className="hover:text-[var(--text-primary)] transition-colors">Tokens</a>
            <a href="#components" className="hover:text-[var(--text-primary)] transition-colors">Components</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-4 py-2 rounded-full text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#0463CA]/25 cursor-pointer"
            >
              Back to App
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="relative z-10 pt-36 pb-28 px-6 md:px-12 max-w-7xl mx-auto space-y-36">

        {/* 2. HERO SECTION WITH APPLE RESTRAINT & DUOLINGO TACTILITY */}
        <section id="hero" className="flex flex-col items-center text-center max-w-4xl mx-auto pt-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-white/10 text-xs font-medium text-[var(--text-muted)] shadow-md mb-8 hover:border-[var(--primary)]/40 transition">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[var(--text-primary)]">Fleurir 2.0 Design Language</span>
            <span className="text-white/30">•</span>
            <span className="text-[var(--accent)]">Apple Restraint × Duolingo Touch</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight font-heading leading-[1.05] text-[var(--text-primary)]">
            Learn better. <br />
            <span className="font-semibold bg-gradient-to-r from-white via-[var(--text-primary)] to-[var(--accent)] bg-clip-text text-transparent">
              Grow faster together.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-8 text-lg sm:text-xl text-[var(--text-muted)] font-normal max-w-2xl leading-relaxed">
            Peer language learning designed with spatial precision, gamified league progression, and verified collaborative discussion threads.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setCurrentLeaguePoints((prev) => Math.min(1000, prev + 25))}
              className="px-7 py-3.5 rounded-full font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0463CA]/30 flex items-center gap-2 cursor-pointer text-base"
            >
              <span>Explore Interactive Demo</span>
              <span className="icon icon-rounded icon-20">arrow_forward</span>
            </button>

            <a
              href="#bento"
              className="px-7 py-3.5 rounded-full font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base cursor-pointer"
            >
              Inspect Bento Grid
            </a>
          </div>

          {/* 3. HERO FOCAL INTERACTIVE ELEMENT: FLOATING GLASSMORPHIC COMMUNITY THREAD */}
          <div className="relative mt-20 w-full max-w-3xl">
            {/* Ambient primary glow underneath focal card */}
            <div 
              className="absolute -inset-4 rounded-3xl blur-2xl opacity-15 pointer-events-none"
              style={{ background: "radial-gradient(circle, #0463CA 0%, transparent 70%)" }}
            />

            {/* Focal Glassmorphic Card Container */}
            <div className="relative rounded-3xl border border-white/15 bg-[var(--bg-surface)]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl text-left transition-all duration-300 hover:border-white/25">
              
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#0463CA] to-[#38BDF8] p-0.5 shadow-md">
                    <img
                      src="/testing/user2.png"
                      alt="Anna"
                      className="h-full w-full rounded-[14px] object-cover bg-black"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base text-[var(--text-primary)]">Anna Rodriguez</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--accent)] font-medium">
                        Mentor
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">@anna • 12m ago</span>
                  </div>
                </div>

                {/* Community Tag Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-white/10 text-xs font-medium">
                  <span>🇫🇷</span>
                  <span className="text-[var(--text-primary)]">French Discussion</span>
                </div>
              </div>

              {/* Thread Content */}
              <div className="py-5 space-y-3">
                <h3 className="text-xl sm:text-2xl font-light tracking-tight font-heading text-white">
                  When should we choose &quot;bien que&quot; over &quot;même si&quot; in conversational French?
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal">
                  I often get corrected on the subjunctive mood following concession conjunctions. Here is a clear rule: <code className="text-xs bg-white/5 px-2 py-1 rounded text-sky-300 font-mono">bien que + subjonctif</code>, whereas <code className="text-xs bg-white/5 px-2 py-1 rounded text-sky-300 font-mono">même si + indicatif</code>.
                </p>
              </div>

              {/* Interactive Accepted Solution Box */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${isAccepted ? "bg-emerald-500/10 border-emerald-500/30" : "bg-[var(--bg-elevated)] border-white/5"}`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="icon icon-rounded text-emerald-400 text-lg">check_circle</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      {isAccepted ? "Verified Community Solution" : "Marked as Open Debate"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAccepted(!isAccepted)}
                    className="text-xs font-medium text-[var(--text-muted)] hover:text-white underline cursor-pointer"
                  >
                    {isAccepted ? "Toggle Off" : "Accept Answer"}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  &quot;Bien que&quot; always triggers the subjunctive because the outcome is perceived as uncertain or hypothetical.
                </p>
              </div>

              {/* Document Attachment & Upvote Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-4 border-t border-white/10">
                {/* Simulated file download chip */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)]/80 border border-white/10 text-xs text-[var(--text-muted)] hover:text-white transition cursor-pointer">
                  <span className="text-base">📄</span>
                  <span className="font-medium text-white/90">subjonctif_guide.pdf</span>
                  <span className="text-[10px] text-[var(--accent)] font-semibold uppercase px-1.5 py-0.5 bg-[var(--primary)]/20 rounded">PDF</span>
                </div>

                {/* Tactile Upvote Button with Apple Scale Physics */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleUpvote}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      hasUpvoted
                        ? "bg-[var(--primary)] text-white shadow-md shadow-[#0463CA]/40 scale-[1.02]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white border border-white/10 hover:border-white/25 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <span className="icon icon-rounded text-base">arrow_upward</span>
                    <span>{upvotes} Upvotes</span>
                  </button>

                  <span className="text-xs text-[var(--text-muted)] hidden sm:inline-block">
                    Click to test live micro-interaction
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURE SHOWCASE: 4-TILE BENTO GRID */}
        <section id="bento" className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
              Modular Architecture
            </span>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight font-heading mt-2">
              The Feature Bento Grid.
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base">
              Precision tiles engineered with spatial restraint and Duolingo gamification modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* BENTO TILE 1: LEAGUES & LADDER PROGRESSION (Col 1 & 2 on desktop) */}
            <div className="md:col-span-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.008] shadow-xl group">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Top 20% Promotion Zone
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Season Reset in 3d 14h</span>
                </div>

                <h3 className="text-3xl font-light tracking-tight font-heading mt-6 text-white">
                  Competitive Leagues Ladder
                </h3>
                <p className="text-[var(--text-muted)] text-sm mt-2 max-w-lg leading-relaxed">
                  Earn points through solved discussions and accepted answers to ascend from Bronze up to Diamond League.
                </p>
              </div>

              {/* Interactive Radial Dial & Tier Preview */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* Circular Progress Ring */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#0463CA"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute font-semibold text-lg text-white font-mono">
                      {Math.round(progressRatio * 100)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Active Rank</span>
                    <h4 className="text-2xl font-semibold text-white">Diamond League</h4>
                    <p className="text-xs text-sky-400 font-mono mt-0.5">{currentLeaguePoints} / {maxPoints} Pts Earned</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentLeaguePoints((prev) => Math.min(1000, prev + 50))}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    +50 Pts
                  </button>
                  <button
                    onClick={() => setCurrentLeaguePoints(700)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* BENTO TILE 2: PEER COLLABORATIONS (Col 3 on desktop) */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.008] shadow-xl group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center text-[var(--accent)] mb-6">
                  <span className="icon icon-rounded text-xl">group</span>
                </div>
                <h3 className="text-2xl font-light tracking-tight font-heading text-white">
                  Peer Connections
                </h3>
                <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">
                  Real-time collaborators collaborating on language threads.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)]/80 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src="/testing/user1.png" alt="Frederic" className="h-9 w-9 rounded-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-elevated)]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Frederic C.</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Active in German</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--accent)]">+15 pts</span>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--bg-elevated)]/80 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src="/testing/user3.png" alt="Sofia" className="h-9 w-9 rounded-full object-cover" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-elevated)]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Sofia M.</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Active in Japanese</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400">Solved ✓</span>
                </div>
              </div>
            </div>

            {/* BENTO TILE 3: RICH FORUMS & ATTACHMENTS (Col 1 on desktop) */}
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.008] shadow-xl group">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-6">
                  <span className="icon icon-rounded text-xl">verified</span>
                </div>
                <h3 className="text-2xl font-light tracking-tight font-heading text-white">
                  Rich Forum Architecture
                </h3>
                <p className="text-[var(--text-muted)] text-sm mt-2 leading-relaxed">
                  Support for PDF cheatsheets, image syntax breakdowns, and mentor verified solutions.
                </p>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white/90">
                  <span>Attachment Preview</span>
                  <span className="text-[var(--accent)] font-mono">1.2 MB</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-white/5">
                  <span className="text-2xl">📊</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">German_Cases_Chart.xlsx</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Excel Spreadsheet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BENTO TILE 4: GLOBAL OPEN COMMUNITIES (Col 2 & 3 on desktop) */}
            <div className="md:col-span-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.008] shadow-xl group">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
                      Global Open Spaces
                    </span>
                    <h3 className="text-3xl font-light tracking-tight font-heading mt-1 text-white">
                      Decentralized Study Communities
                    </h3>
                  </div>

                  {/* Community Switcher Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--bg-elevated)] border border-white/10">
                    {(Object.keys(communitiesData) as Array<keyof typeof communitiesData>).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCommunity(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                          selectedCommunity === key
                            ? "bg-[var(--primary)] text-white shadow-md"
                            : "text-[var(--text-muted)] hover:text-white"
                        }`}
                      >
                        {communitiesData[key].symbol} {communitiesData[key].name}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[var(--text-muted)] text-sm mt-4 leading-relaxed max-w-xl">
                  {activeCommunity.description}
                </p>
              </div>

              {/* Community Metrics Preview */}
              <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 border border-white/5">
                  <p className="text-xs text-[var(--text-muted)]">Total Members</p>
                  <p className="text-2xl font-light text-white mt-1 font-heading">{activeCommunity.members}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 border border-white/5">
                  <p className="text-xs text-[var(--text-muted)]">Forum Posts</p>
                  <p className="text-2xl font-light text-white mt-1 font-heading">{activeCommunity.posts}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/60 border border-white/5">
                  <p className="text-xs text-[var(--text-muted)]">Primary Focus</p>
                  <p className="text-sm font-medium text-[var(--accent)] mt-1 truncate">{activeCommunity.tag}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. DESIGN TOKENS & COLOR PALETTE SANDBOX */}
        <section id="tokens" className="space-y-8 pt-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
              Tokens & Variables
            </span>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight font-heading mt-2">
              Color Token System.
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base">
              Defined CSS variables in global stylesheet for system-wide consistency.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "--primary", hex: "#0463CA", label: "Brand Primary" },
              { name: "--primary-hover", hex: "#257BE3", label: "Primary Hover" },
              { name: "--primary-active", hex: "#034B9A", label: "Primary Active" },
              { name: "--accent", hex: "#38BDF8", label: "Cyan Accent" },
              { name: "--bg-base", hex: "#080C11", label: "Base Surface" },
              { name: "--bg-surface", hex: "#0E141E", label: "Card Surface" },
              { name: "--bg-elevated", hex: "#17202F", label: "Elevated Chip" },
              { name: "--border-subtle", hex: "#1E2A3C", label: "Subtle Border" },
              { name: "--text-primary", hex: "#F1F5F9", label: "Text Primary" },
              { name: "--text-muted", hex: "#94A3B8", label: "Text Muted" },
              { name: "--success", hex: "#10B981", label: "State Success" },
              { name: "--warning", hex: "#F59E0B", label: "State Warning" },
            ].map((token) => (
              <div
                key={token.name}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between gap-4 transition hover:border-white/20"
              >
                <div className="h-14 w-full rounded-xl border border-white/10 shadow-inner" style={{ backgroundColor: token.hex }} />
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{token.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-white">{token.label}</span>
                    <span className="text-xs font-mono text-white/50">{token.hex}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. COMPONENT PLAYGROUND: BUTTONS & INTERACTIVE STATES */}
        <section id="components" className="space-y-8 pt-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--accent)]">
              Micro-Interactions
            </span>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight font-heading mt-2">
              Tactile Component States.
            </h2>
            <p className="text-[var(--text-muted)] mt-3 text-base">
              Apple-style fluid scaling (scale 1.02 hover, scale 0.98 active) with translucent border highlights.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Pill Action Buttons
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-6 py-3 rounded-full font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#0463CA]/25 cursor-pointer text-sm">
                  Primary Action
                </button>
                <button className="px-6 py-3 rounded-full font-medium text-white bg-[var(--bg-elevated)] hover:bg-white/10 border border-[var(--border-subtle)] hover:border-white/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm">
                  Secondary Action
                </button>
                <button className="px-6 py-3 rounded-full font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm">
                  Success Badge Action
                </button>
                <button className="px-6 py-3 rounded-full font-semibold text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm">
                  Destructive Action
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Pill Status Chips & Badges
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Solved ✓
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--primary)]/20 text-[var(--accent)] border border-[var(--primary)]/40">
                  Diamond League 🏆
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  3 Day Streak 🔥
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-white/70 border border-white/10">
                  Member Role
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
