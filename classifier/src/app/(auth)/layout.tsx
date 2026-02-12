import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getSession } from "@/server/better-auth/server";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();
	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen">
			{/* Branding Panel */}
			<div className="relative hidden w-1/2 overflow-hidden bg-foreground lg:flex">
				{/* Subtle grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
					}}
				/>

				{/* Floating document shapes */}
				<div className="absolute inset-0">
					<div className="absolute top-[12%] left-[8%] h-48 w-36 rotate-[-8deg] rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm" />
					<div className="absolute top-[28%] left-[22%] h-56 w-40 rotate-[4deg] rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm" />
					<div className="absolute right-[12%] bottom-[18%] h-44 w-34 rotate-[12deg] rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm" />
					<div className="absolute right-[28%] bottom-[32%] h-52 w-38 rotate-[-5deg] rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm" />
					<div className="absolute top-[55%] left-[15%] h-40 w-32 rotate-[8deg] rounded-lg border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm" />
				</div>

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-between p-12">
					<Link href="/">
						<Logo className="h-8 w-auto" variant="light" />
					</Link>

					<div className="max-w-md">
						<h1 className="mb-4 font-semibold text-3xl text-primary-foreground leading-tight tracking-tight">
							Classify mortgage documents in seconds, not hours.
						</h1>
						<p className="text-base text-primary-foreground/60 leading-relaxed">
							Upload consolidated PDFs and let AI automatically split, classify,
							and organize across 47 document types — ready for Encompass.
						</p>

						<div className="mt-10 flex gap-6">
							<div>
								<div className="font-semibold text-2xl text-primary-foreground">
									47
								</div>
								<div className="mt-0.5 text-primary-foreground/40 text-xs uppercase tracking-wider">
									Doc types
								</div>
							</div>
							<div className="w-px bg-white/10" />
							<div>
								<div className="font-semibold text-2xl text-primary-foreground">
									8
								</div>
								<div className="mt-0.5 text-primary-foreground/40 text-xs uppercase tracking-wider">
									Categories
								</div>
							</div>
							<div className="w-px bg-white/10" />
							<div>
								<div className="font-semibold text-2xl text-primary-foreground">
									&lt;30s
								</div>
								<div className="mt-0.5 text-primary-foreground/40 text-xs uppercase tracking-wider">
									Processing
								</div>
							</div>
						</div>
					</div>

					<p className="text-primary-foreground/30 text-xs">
						&copy; {new Date().getFullYear()} LoanLight. All rights reserved.
					</p>
				</div>
			</div>

			{/* Form Panel */}
			<div className="flex flex-1 flex-col">
				{/* Mobile header */}
				<div className="flex items-center justify-between p-6 lg:hidden">
					<Link href="/">
						<Logo className="h-6 w-auto" variant="dark" />
					</Link>
				</div>

				{/* Form container */}
				<div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
					<div className="w-full max-w-[400px]">{children}</div>
				</div>
			</div>
		</div>
	);
}
