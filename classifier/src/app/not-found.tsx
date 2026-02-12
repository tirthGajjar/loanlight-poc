"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

function useNotFoundContext() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];

	if (!first) {
		return {
			title: "Page not found",
			description:
				"The page you're looking for doesn't exist or may have been moved.",
		};
	}

	// Contextual messages based on the URL path
	const contextMap: Record<string, { title: string; description: string }> = {
		dashboard: {
			title: "Page not found",
			description:
				"This dashboard page doesn't exist. It may have been removed or you might not have access.",
		},
		documents: {
			title: "Document not found",
			description:
				"This document doesn't exist or may have been deleted. Check the URL or go back to your documents.",
		},
		jobs: {
			title: "Job not found",
			description:
				"This classification job doesn't exist or may have been completed and archived.",
		},
		settings: {
			title: "Settings page not found",
			description:
				"This settings page doesn't exist. It may have been moved or renamed.",
		},
	};

	if (contextMap[first]) return contextMap[first];

	// Fallback: show the attempted path for clarity
	return {
		title: "Page not found",
		description: `Nothing exists at /${segments.join("/")}. You may have followed a broken link or typed the URL incorrectly.`,
	};
}

export default function NotFound() {
	const { title, description } = useNotFoundContext();

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f]">
			{/* Blue conic glow — same as landing lamp */}
			<motion.div
				animate={{ opacity: 1 }}
				className="pointer-events-none absolute top-0 left-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-conic from-blue-500/15 via-transparent to-blue-500/15 blur-3xl"
				initial={{ opacity: 0 }}
				transition={{ duration: 1.2 }}
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

			{/* Floating scattered documents */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="pointer-events-none absolute top-[8%] left-[6%] h-44 w-32 rotate-[-18deg] rounded-lg border border-white/[0.04] bg-white/[0.015]"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.3, duration: 0.8 }}
			/>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="pointer-events-none absolute top-[14%] right-[10%] h-52 w-36 rotate-[22deg] rounded-lg border border-white/[0.06] bg-white/[0.02]"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.5, duration: 0.8 }}
			/>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="pointer-events-none absolute bottom-[12%] left-[12%] h-40 w-28 rotate-[14deg] rounded-lg border border-white/[0.05] bg-white/[0.018]"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.7, duration: 0.8 }}
			/>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="pointer-events-none absolute right-[8%] bottom-[20%] h-48 w-34 rotate-[-10deg] rounded-lg border border-white/[0.04] bg-white/[0.015]"
				initial={{ opacity: 0, y: 20 }}
				transition={{ delay: 0.6, duration: 0.8 }}
			/>

			{/* Main content */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
				initial={{ opacity: 0, y: 30 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<Logo className="h-8 w-auto md:h-10" variant="light" />

				{/* 404 number with scan-line styling */}
				<div className="relative">
					<div className="font-bold font-mono text-[8rem] text-white/[0.04] leading-none tracking-tighter md:text-[12rem]">
						404
					</div>
					<div className="absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden">
						{Array.from({ length: 6 }).map((_, i) => (
							<motion.div
								animate={{ scaleX: 1 }}
								className="h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
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
						{title}
					</h1>
					<p className="max-w-md text-slate-500 text-sm md:text-base">
						{description}
					</p>
				</div>

				<div className="flex items-center gap-4">
					<Link
						className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
						href="/"
					>
						Go Home
						<svg
							aria-hidden="true"
							className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path
								d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</Link>
					<Link
						className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-sm text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
						href="/dashboard"
					>
						Dashboard
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
