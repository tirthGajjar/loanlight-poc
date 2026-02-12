"use client";

import { motion } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/utils";

export const LampContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden bg-[#0a0a0f]",
				className,
			)}
		>
			<div className="relative flex w-full flex-1 flex-col items-center">
				<motion.div
					className="absolute top-0 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-conic from-blue-500/20 via-transparent to-blue-500/20 blur-3xl"
					initial={{ opacity: 0.5 }}
					transition={{ duration: 1 }}
					whileInView={{ opacity: 1 }}
				/>
				<motion.div
					className="absolute top-0 left-1/2 -z-10 h-[300px] -translate-x-1/2 rounded-full bg-gradient-conic from-blue-500/30 via-transparent to-transparent blur-2xl"
					initial={{ opacity: 0.5, width: "20rem" }}
					transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
					whileInView={{ opacity: 1, width: "40rem" }}
				/>
			</div>

			<div className="relative z-10 flex w-full flex-col items-center px-4 pt-20 pb-16">
				{children}
			</div>
		</div>
	);
};
