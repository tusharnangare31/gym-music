import { useState, useEffect, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, SkipBack, SkipForward, X, ListMusic } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Gym quotes (matching lohalakkad.in) ─── */
const QUOTES = [
  "Ab baj raha hai: Uncle ji ka personal record.",
  "Agla gaana trainer ki marzi se.",
  "Dumbbell wapas rack pe rakh dena, bhai.",
  "Aaj leg day hai — bahane kal banana.",
  "Protein baad mein, pehle poora set.",
  "Bhai, ek rep aur… bas ek aur.",
  "Machine khaali nahi hai, bhaiya ka set chal raha hai.",
  "Gaana badlega, dard nahi.",
  "Warm-up ke naam par gossip band karo.",
  "Sheeshe mein pose baad mein, set pehle.",
  "Ye gaana bajte hi weight halka lagta hai.",
  "Cardio kal se. Pakka.",
  "Loha uthao, mohalla jagao.",
];

const formatTime = (time: number) => {
  if (isNaN(time) || !isFinite(time)) return '0:00';
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

/* ══════════════════════════════════════════════ */

const LohaHome = () => {
  const {
    currentSong, isPlaying, currentTime, duration, queue,
    togglePlay, nextSong, previousSong, seek, playAtIndex,
  } = useMusic();

  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [listeners, setListeners] = useState(() => 400 + Math.floor(Math.random() * 101));

  /* ── Clock ── */
  const updateClock = useCallback(() => {
    setClock(
      new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      }).format(new Date()),
    );
  }, []);

  useEffect(() => {
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, [updateClock]);

  /* ── Rotating quotes ── */
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 6200);
    return () => clearInterval(id);
  }, []);

  /* ── Simulated listener count ── */
  useEffect(() => {
    function tick() {
      setListeners(prev => {
        const d = Math.floor(Math.random() * 9) - 4;
        return Math.max(400, Math.min(500, prev + d));
      });
      timeout = setTimeout(tick, 3500 + Math.random() * 4000);
    }
    let timeout = setTimeout(tick, 3500 + Math.random() * 4000);
    return () => clearTimeout(timeout);
  }, []);

  /* ── Helpers ── */
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const coverUrl = currentSong?.cover ?? 'https://i.ytimg.com/vi/bVzIHMskZmQ/mqdefault.jpg';

  /* ═══════════ RENDER ═══════════ */
  return (
    <main className="relative min-h-[100svh] overflow-hidden isolate grid grid-rows-[auto_1fr_auto_auto]">

      {/* ── Background layers ── */}
      <div
        className="absolute inset-0 -z-20 scale-[1.015] bg-center bg-cover"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />
      <div className="absolute inset-0 -z-10" style={{
        background: [
          'radial-gradient(circle at 50% 44%, rgba(18,7,4,.16) 0 24%, rgba(12,5,3,.66) 74%, rgba(5,2,1,.82) 100%)',
          'linear-gradient(180deg, rgba(7,3,2,.58), transparent 24%, transparent 66%, rgba(7,3,2,.72))',
        ].join(','),
      }} />

      {/* ────────── TOP BAR ────────── */}
      <header className="px-6 py-5 sm:px-7 flex justify-between items-center max-[640px]:justify-center max-[640px]:gap-2">
        <div className="flex gap-2.5 max-[640px]:gap-1.5 max-[640px]:justify-center">
          {/* Clock pill */}
          <span className="h-[34px] border border-white/[.19] bg-[rgba(15,9,7,.65)] backdrop-blur-[12px] rounded-full inline-flex items-center gap-[7px] px-[13px] text-[#f8f3e9] text-[12px] font-extrabold tracking-[.02em] shadow-[0_7px_28px_rgba(0,0,0,.2)] max-[640px]:h-[31px] max-[640px]:px-2.5 max-[640px]:text-[10px]">
            {clock || '--:--'}
          </span>
          {/* Listener pill */}
          <span className="h-[34px] border border-white/[.19] bg-[rgba(15,9,7,.65)] backdrop-blur-[12px] rounded-full inline-flex items-center gap-[7px] px-[13px] text-[#f8f3e9] text-[12px] shadow-[0_7px_28px_rgba(0,0,0,.2)] max-[640px]:h-[31px] max-[640px]:px-2.5 max-[640px]:text-[10px]">
            <i className="w-1.5 h-1.5 rounded-full bg-[#26d7a1] shadow-[0_0_9px_#26d7a1] inline-block shrink-0" />
            <strong>{listeners}</strong> lifting right now
          </span>
        </div>
        {/* YT Music link */}
        <a
          href="https://music.youtube.com/playlist?list=PLVm5_C02i2jw"
          target="_blank" rel="noreferrer"
          className="hidden sm:inline-flex h-[34px] border border-white/[.19] bg-[rgba(15,9,7,.65)] backdrop-blur-[12px] rounded-full items-center gap-[7px] px-[13px] text-[#f8f3e9] text-[12px] font-extrabold no-underline shadow-[0_7px_28px_rgba(0,0,0,.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[rgba(48,28,21,.9)]"
        >
          <span className="text-[#ff403a]">▶</span> YT Music
        </a>
      </header>

      {/* ────────── HERO ────────── */}
      <section className="flex flex-col justify-center items-center text-center px-5 py-5 max-[640px]:px-3.5 max-[640px]:py-2 min-h-0">

        {/* Brand block */}
        <div className="drop-shadow-[0_8px_8px_rgba(0,0,0,.46)] -rotate-1 max-[640px]:rotate-0">
          <h1 className="hero-title m-0 flex flex-col gap-4 max-[640px]:gap-2">
            <span className="block">लोहे का</span>
            <span className="block pl-[.08em]">जिगर</span>
          </h1>
          <p className="mt-5 max-[640px]:mt-4 text-[#e6bd61] font-bold font-serif tracking-[.22em] max-[640px]:tracking-[.15em] leading-tight uppercase"
             style={{ fontSize: 'clamp(9px, .9vw, 13px)' }}>
            LOHE KA JIGAR · POWERED BY YOUR GYM
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-6 mb-3 max-[640px]:mt-4 max-[640px]:mb-2.5 text-[#f5e3bd] italic drop-shadow-[0_2px_8px_#000]"
           style={{ fontFamily: 'var(--font-kalam)', fontSize: 'clamp(18px, 2vw, 29px)' }}>
          Loha Utha, Volume Badha.
        </p>

        {/* ─── PLAYER STACK ─── */}
        <div className="relative w-[min(490px,92vw)] max-[640px]:w-[min(96vw,430px)] mx-auto">

          {/* ── Player card ── */}
          <div className={clsx(
            "relative w-full rounded-full border border-white/[.23]",
            "bg-[linear-gradient(120deg,rgba(19,10,6,.93),rgba(39,22,13,.88))]",
            "shadow-[0_12px_34px_rgba(0,0,0,.36)]",
            "grid items-center gap-2.5 p-[9px_11px] text-left z-20",
            "grid-cols-[48px_minmax(0,1fr)_auto]",
            "max-[640px]:grid-cols-[42px_minmax(0,1fr)_auto] max-[640px]:gap-2 max-[640px]:p-[8px_9px]",
            "max-[380px]:grid-cols-[38px_minmax(0,1fr)_auto] max-[380px]:gap-1.5 max-[380px]:px-[7px]",
          )}>

            {/* Spinning disc */}
            <div className={clsx(
              "relative rounded-full overflow-hidden",
              "w-12 h-12 max-[640px]:w-[42px] max-[640px]:h-[42px] max-[380px]:w-[38px] max-[380px]:h-[38px]",
              "border border-[rgba(255,216,169,.55)]",
              "shadow-[0_0_0_2px_rgba(20,10,5,.5),inset_0_0_12px_rgba(0,0,0,.42)]",
              isPlaying && "spin-disc",
            )}>
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover scale-[1.08] rounded-full" />
              {/* Centre hole */}
              <div className="absolute left-1/2 top-1/2 w-[9px] h-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1b0e08] border-2 border-[rgba(255,224,183,.78)] shadow-[0_0_0_2px_rgba(0,0,0,.25)]" />
            </div>

            {/* Song info */}
            <div className="min-w-0 max-[640px]:text-center">
              <p className="m-0 mb-1 font-bold text-[11px] max-[640px]:text-[9px] leading-tight text-white truncate">
                {currentSong?.title || 'Local Gym Ke Gaane'}
              </p>
              <p className="m-0 mb-1.5 text-[#baa991] text-[9px] max-[640px]:text-[7px] truncate">
                {currentSong ? `Lohe Ka Jigar · ${currentSong.artist}` : 'Lohe Ka Jigar · Local Gym Ke Gaane'}
              </p>
              {/* Progress */}
              <div className="grid items-center gap-[5px] max-[640px]:gap-1 text-[#9c8c7b] font-bold font-mono"
                   style={{ gridTemplateColumns: '25px 1fr 25px', fontSize: 7 }}>
                <span className="max-[640px]:text-[6px]">{formatTime(currentTime)}</span>
                <div className="h-1 max-[640px]:h-[3px] rounded-full bg-[#57483f] overflow-hidden cursor-pointer" onClick={handleSeek}>
                  <div className="h-full bg-[#e56f08] rounded-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="max-[640px]:text-[6px]">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 max-[380px]:gap-1">
              <ControlBtn onClick={previousSong}>
                <SkipBack size={13} fill="currentColor" />
              </ControlBtn>

              <button
                onClick={togglePlay}
                className="w-10 h-10 max-[640px]:w-9 max-[640px]:h-9 max-[380px]:w-[34px] max-[380px]:h-[34px] rounded-full bg-[#e56f08] border border-[#ffad45] text-[#1a1008] flex items-center justify-center shadow-[0_0_18px_rgba(229,111,8,.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {isPlaying
                  ? <Pause size={16} fill="currentColor" />
                  : <Play  size={16} fill="currentColor" className="ml-[2px]" />}
              </button>

              <ControlBtn onClick={nextSong}>
                <SkipForward size={13} fill="currentColor" />
              </ControlBtn>

              <button
                onClick={() => setPlaylistOpen(v => !v)}
                className="w-[30px] h-[30px] max-[640px]:w-[26px] max-[640px]:h-[26px] max-[380px]:w-6 max-[380px]:h-6 rounded-full bg-transparent border border-transparent text-[#f4e9da] flex items-center justify-center hover:border-[rgba(255,190,113,.28)] transition-colors cursor-pointer"
              >
                <ListMusic size={15} />
              </button>
            </div>
          </div>

          {/* ── Playlist modal (pops up above player) ── */}
          <AnimatePresence>
            {playlistOpen && (
              <motion.div
                initial={{ opacity: 0, y: 34, scaleY: 0.06 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: 34, scaleY: 0.06 }}
                transition={{ duration: 0.42, ease: [0.18, 0.9, 0.24, 1] }}
                className="absolute left-0 right-0 bottom-[calc(100%+10px)] z-30 origin-bottom"
              >
                <div className={clsx(
                  "w-full flex flex-col overflow-hidden rounded-[21px] max-[640px]:rounded-[20px]",
                  "border border-[rgba(255,230,194,.3)]",
                  "bg-[linear-gradient(135deg,rgba(74,48,32,.4),rgba(18,10,7,.5)_52%,rgba(92,54,31,.3))]",
                  "backdrop-blur-[22px] backdrop-saturate-[1.35]",
                  "shadow-[0_-18px_55px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.22),inset_0_-1px_0_rgba(255,171,91,.08)]",
                  "max-h-[min(52svh,430px)] max-[640px]:max-h-[min(48svh,380px)]",
                )}>
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4 max-[640px]:px-4 max-[640px]:pt-4 max-[640px]:pb-3 border-b border-white/10 shrink-0">
                    <div>
                      <h2 className="m-0 font-bold text-lg max-[640px]:text-base leading-tight text-white" style={{ fontFamily: 'var(--font-hindi)' }}>
                        Local Gym Ke Gaane
                      </h2>
                      <p className="mt-1 text-[#b9a48d] text-[9px] tracking-[.13em]">LOHE KA JIGAR · SHUFFLE PLAYLIST</p>
                    </div>
                    <button
                      onClick={() => setPlaylistOpen(false)}
                      className="w-[34px] h-[34px] border border-white/20 rounded-full bg-white/[.07] text-white flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Song list */}
                  <div className="flex-1 overflow-y-auto p-2.5 max-[640px]:px-[7px] playlist-scroll">
                    {queue.length === 0 ? (
                      /* Skeleton loader */
                      <div className="space-y-2 p-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-[60px] rounded-[13px] skeleton-shimmer bg-[rgba(255,255,255,.04)]" />
                        ))}
                      </div>
                    ) : (
                      queue.map((song, idx) => (
                        <button
                          key={`${song.id}-${idx}`}
                          onClick={() => { playAtIndex(idx); setPlaylistOpen(false); }}
                          className={clsx(
                            "w-full grid items-center p-2 max-[640px]:p-[7px] border-0 rounded-[13px] text-left cursor-pointer transition-all duration-[.18s]",
                            "hover:bg-white/[.08] hover:translate-x-0.5",
                            "grid-cols-[23px_46px_minmax(0,1fr)] gap-2.5",
                            "max-[640px]:grid-cols-[20px_42px_minmax(0,1fr)] max-[640px]:gap-2",
                            currentSong?.videoId === song.videoId
                              ? "bg-[linear-gradient(90deg,rgba(229,111,8,.24),rgba(255,255,255,.05))] shadow-[inset_3px_0_#e56f08]"
                              : "bg-transparent",
                          )}
                        >
                          <span className="text-[#987e68] font-bold text-[9px] font-mono text-center">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <img
                            src={song.cover}
                            alt=""
                            className="w-[46px] h-[46px] max-[640px]:w-[42px] max-[640px]:h-[42px] rounded-lg object-cover bg-[#24150e]"
                          />
                          <div className="min-w-0">
                            <span className="block truncate text-[11px] max-[640px]:text-[10px] font-bold text-white">{song.title}</span>
                            <span className="block mt-1 text-[#aa9582] text-[8px]">{song.artist}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Quote ── */}
        <div className="w-[min(490px,92vw)] max-[640px]:w-[min(96vw,430px)] mx-auto mt-4 max-[640px]:mt-3 min-h-[48px] px-4 py-2 max-[640px]:px-3 border border-[rgba(214,144,24,.58)] border-b-[rgba(147,34,19,.92)] rounded-t-[18px] max-[640px]:rounded-t-[15px] bg-[rgba(12,7,4,.58)] backdrop-blur-[9px] grid place-items-center">
          <p key={quoteIdx} className="m-0 text-center font-serif italic text-sm max-[640px]:text-[13px] leading-relaxed text-[#fff6df] quote-animate">
            &ldquo;{QUOTES[quoteIdx]}&rdquo;
          </p>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="px-5 py-2.5 max-[640px]:pb-[max(10px,env(safe-area-inset-bottom))] text-center bg-[rgba(8,4,2,.78)] text-[#9f8c70] text-[9px] max-[640px]:text-[7px] max-[640px]:leading-relaxed font-extrabold tracking-[.28em]">
        MOHALLE KE GYM SE SEEDHA SPEAKER TAK
      </footer>
    </main>
  );
};

/* ── Small reusable control button ── */
function ControlBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-[30px] h-[30px] max-[640px]:w-[26px] max-[640px]:h-[26px] max-[380px]:w-6 max-[380px]:h-6 bg-[#4a413d] border border-white/25 rounded-full text-white flex items-center justify-center hover:scale-[1.08] hover:border-[#e2a130] active:scale-95 transition-all cursor-pointer"
    >
      {children}
    </button>
  );
}

export default LohaHome;
