"use client";

import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LampContainer } from "@/components/ui/lamp";
import { ArrowRightIcon, FEATURES } from "./landing-icons";

export function Landing() {
	return (
		<LampContainer>
			<motion.div
				className="w-full max-w-4xl"
				initial={{ opacity: 0, y: 30 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<div className="flex flex-col items-center gap-6 text-center">
					<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-medium text-blue-400 text-xs">
						<HugeiconsIcon className="size-3.5" icon={SparklesIcon} />
						AI-Powered Document Intelligence
					</span>

					<div className="flex flex-col items-center gap-3">
						<Logo className="h-10 w-auto md:h-14" variant="light" />
						<span className="font-normal text-slate-500 text-xl md:text-2xl">
							Document Classification
						</span>
					</div>

					<p className="max-w-lg text-lg text-slate-400">
						<span className="text-slate-300">
							Upload consolidated mortgage PDFs
						</span>{" "}
						and automatically
						<span className="text-slate-300"> split, classify,</span> and
						organize your documents with precision.
					</p>

					<div className="mt-2 flex gap-4">
						<Link
							className="group relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-3 font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
							href="/sign-in"
						>
							Sign In
							<ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
						</Link>
						<Link
							className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
							href="/sign-up"
						>
							Create Account
						</Link>
					</div>

					<div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
						{FEATURES.map((feature) => (
							<div
								className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]"
								key={feature.title}
							>
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
								<div className="relative mb-4 flex items-center justify-between">
									<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-bold text-slate-400 text-sm transition-colors duration-300 group-hover:bg-blue-500/10 group-hover:text-blue-400">
										{feature.num}
									</span>
									<feature.icon className="h-5 w-5 text-slate-500 transition-colors duration-300 group-hover:text-slate-300" />
								</div>
								<div className="relative">
									<div className="font-medium text-slate-200 transition-colors duration-300 group-hover:text-white">
										{feature.title}
									</div>
									<div className="mt-1 text-slate-500 text-sm transition-colors duration-300 group-hover:text-slate-400">
										{feature.desc}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</motion.div>
		</LampContainer>
	);
}
