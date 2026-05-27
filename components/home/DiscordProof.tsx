"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export function DiscordProof() {
  return (
    <section className="relative mx-auto mt-14 w-full max-w-[1480px] overflow-hidden rounded-[42px] border border-white/[0.06] bg-[#050607] px-6 py-8 sm:px-10 sm:py-10">
      
      <div className="absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[#6CFF72]/10 blur-[50px] md:blur-[120px]" />

        <div className="absolute right-[-10%] top-[10%] h-[520px] w-[520px] rounded-full bg-[#7c3aed]/20 blur-[60px] md:blur-[150px]" />

        <div className="absolute bottom-[-20%] left-[20%] h-[400px] w-[400px] rounded-full bg-[#6CFF72]/5 blur-[50px] md:blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
      </div>

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-[#6CFF72]/20 bg-[#6CFF72]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6CFF72]"
          >
            <span className="h-2 w-2 md:animate-pulse rounded-full bg-[#6CFF72]" />
            Private AI Trading Community
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
            className="mt-7 text-[54px] font-semibold leading-[0.92] tracking-tight text-white sm:text-[72px]"
          >
            Join the
            <br />
            Bullions
            <br />
            Trading Club
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            viewport={{ once: true }}
            className="mt-6 max-w-[620px] text-[17px] leading-8 text-white/55"
          >
            Live traders. AI-powered copy trading. Real-time leaderboard.
            Follow profitable traders, compete against the bot, and access
            private BullPad launches before the public.
          </motion.p>

          <div className="mt-7 flex flex-wrap gap-3">
            {[
              "94+ members",
              "Live trading chat",
              "AI copy trading signals",
              "Weekly challenges",
            ].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur-sm md:backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="https://discord.gg/YkFBXRD6rz"
              target="_blank"
              className="group relative inline-flex h-[64px] items-center justify-center gap-3 overflow-hidden rounded-full bg-[#5865F2] px-7 text-sm font-semibold text-white shadow-[0_0_60px_rgba(88,101,242,0.28)] transition-all duration-300 hover:scale-[1.03]"
            >
              <Image
                src="/discord.webp"
                alt="Discord"
                width={34}
                height={34}
                className="relative z-10 rounded-full"
              />

              <span className="relative z-10 flex flex-col items-start leading-tight">
                <span>Join Discord</span>
                <span className="text-[11px] font-medium text-white/65">
                  94+ members · live room
                </span>
              </span>

              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_70%)]" />
              </div>
            </Link>

            <Link
              href="/bullpad#leaderboard"
              className="inline-flex h-[64px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-8 text-sm font-semibold text-white/80 backdrop-blur-sm md:backdrop-blur-xl transition hover:bg-white/[0.05]"
            >
              View Leaderboard
            </Link>

            <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <div className="flex -space-x-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#6CFF72] text-xs font-bold text-black ring-2 ring-[#111214]">A</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#8b5cf6] text-xs font-bold text-white ring-2 ring-[#111214]">G</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold text-black ring-2 ring-[#111214]">N</span>
              </div>

              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">Online now</p>
                <p className="text-[11px] text-white/40">traders + investors</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          
          <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.32),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(108,255,114,0.16),transparent_40%)] blur-md md:blur-2xl" />

          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-[#0b0d11]/90 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-md md:blur-2xl">
            
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent)]" />

            <div className="absolute bottom-0 left-0 right-0 h-[220px] opacity-40">
              <svg
                viewBox="0 0 600 220"
                className="h-full w-full"
                fill="none"
              >
                <path
                  d="M0 180L70 160L120 165L180 120L240 135L310 90L380 110L450 70L520 100L600 40"
                  stroke="#6CFF72"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <path
                  d="M0 180L70 160L120 165L180 120L240 135L310 90L380 110L450 70L520 100L600 40"
                  stroke="url(#glow)"
                  strokeWidth="18"
                  opacity="0.25"
                />

                <defs>
                  <linearGradient id="glow">
                    <stop stopColor="#6CFF72" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10 flex min-h-[520px] items-center justify-center p-8">
              
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
                className="w-full max-w-[420px] rounded-[32px] border border-white/[0.08] bg-[#12141a]/90 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.55)] backdrop-blur-md md:blur-2xl"
              >
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      bullions trading club
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      private AI trading room
                    </p>
                  </div>

                  <div className="rounded-full border border-[#6CFF72]/20 bg-[#6CFF72]/10 px-3 py-1 text-xs font-semibold text-[#6CFF72]">
                    LIVE
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "TORION detected recovery momentum",
                    "Alex activated Copy Engine",
                    "Nika survived withdrawal cycle",
                    "Leaderboard updated live",
                    "Ghost Alpha up +18.4%",
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: i * 0.08,
                      }}
                      className="flex items-center gap-3 rounded-[20px] border border-white/[0.05] bg-white/[0.03] p-4"
                    >
                      <div
                        className={
                          i % 2 === 0
                            ? "h-2.5 w-2.5 rounded-full bg-[#6CFF72]"
                            : "h-2.5 w-2.5 rounded-full bg-[#7c3aed]"
                        }
                      />

                      <p className="text-sm text-white/70">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="https://discord.gg/YkFBXRD6rz"
                  target="_blank"
                  className="mt-6 inline-flex h-[56px] w-full items-center justify-center rounded-full bg-[#5865F2] text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Accept Invite
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
