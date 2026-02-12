"use client";

import "@/styles/globals.css";

import { motion } from "framer-motion";

export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body className="antialiased">
				<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]">
					{/* Red/amber conic glow — destructive variant of the landing lamp */}
					<motion.div
						animate={{ opacity: 1 }}
						className="pointer-events-none absolute top-0 left-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-conic from-red-500/15 via-transparent to-amber-500/10 blur-3xl"
						initial={{ opacity: 0 }}
						transition={{ duration: 1.2 }}
					/>

					{/* Secondary warm glow */}
					<motion.div
						animate={{ opacity: 0.7 }}
						className="pointer-events-none absolute top-0 left-1/2 -z-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-conic from-red-500/20 via-transparent to-transparent blur-2xl"
						initial={{ opacity: 0 }}
						transition={{ delay: 0.3, duration: 1 }}
					/>

					{/* Subtle grid */}
					<div
						className="pointer-events-none absolute inset-0 opacity-[0.025]"
						style={{
							backgroundImage:
								"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
							backgroundSize: "48px 48px",
						}}
					/>

					{/* Jammed / crumpled documents — overlapping, stuck */}
					<motion.div
						animate={{ opacity: 1, rotate: -6 }}
						className="pointer-events-none absolute top-[18%] left-[15%] h-48 w-36 rotate-[-6deg] rounded-lg border border-red-500/[0.06] bg-red-500/[0.015]"
						initial={{ opacity: 0, rotate: -2 }}
						transition={{ delay: 0.4, duration: 0.8 }}
					/>
					<motion.div
						animate={{ opacity: 1, rotate: 3 }}
						className="pointer-events-none absolute top-[20%] left-[17%] h-52 w-38 rotate-[3deg] rounded-lg border border-white/[0.05] bg-white/[0.015]"
						initial={{ opacity: 0, rotate: 0 }}
						transition={{ delay: 0.5, duration: 0.8 }}
					/>
					<motion.div
						animate={{ opacity: 1, rotate: 8 }}
						className="pointer-events-none absolute right-[12%] bottom-[16%] h-44 w-32 rotate-[8deg] rounded-lg border border-red-500/[0.05] bg-red-500/[0.01]"
						initial={{ opacity: 0, rotate: 4 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					/>
					<motion.div
						animate={{ opacity: 1, rotate: -4 }}
						className="pointer-events-none absolute right-[14%] bottom-[19%] h-40 w-30 rotate-[-4deg] rounded-lg border border-white/[0.04] bg-white/[0.01]"
						initial={{ opacity: 0, rotate: -1 }}
						transition={{ delay: 0.7, duration: 0.8 }}
					/>

					{/* Main content */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
						initial={{ opacity: 0, y: 30 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						{/* Plain text logo — can't use Logo component in global-error */}
						<span className="font-semibold text-lg text-white/80 tracking-tight">
							LoanLight
						</span>

						{/* 500 number with glitch-line styling */}
						<div className="relative">
							<div className="font-bold font-mono text-[8rem] text-white/[0.04] leading-none tracking-tighter md:text-[12rem]">
								500
							</div>
							{/* Disrupted scan lines — red-tinted */}
							<div className="absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden">
								{Array.from({ length: 6 }).map((_, i) => (
									<motion.div
										animate={{ scaleX: 1 }}
										className="h-px bg-gradient-to-r from-transparent via-red-400/25 to-transparent"
										initial={{ scaleX: 0 }}
										key={i}
										transition={{
											delay: 0.8 + i * 0.08,
											duration: 0.6,
											ease: "easeOut",
										}}
									/>
								))}
							</div>
						</div>

						<div className="flex flex-col items-center gap-3">
							<h1 className="font-semibold text-slate-200 text-xl tracking-tight md:text-2xl">
								Something went wrong
							</h1>
							<p className="max-w-sm text-slate-500 text-sm md:text-base">
								An unexpected error occurred while processing your request. Our
								team has been notified.
							</p>
						</div>

						<div className="flex items-center gap-4">
							<button
								className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
								onClick={() => reset()}
								type="button"
							>
								Try Again
								<svg
									aria-hidden="true"
									className="h-4 w-4 transition-transform group-hover:rotate-45"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path
										d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
							<a
								className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-sm text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
								href="/"
							>
								Go Home
							</a>
						</div>
					</motion.div>
				</div>
			</body>
		</html>
	);
}
