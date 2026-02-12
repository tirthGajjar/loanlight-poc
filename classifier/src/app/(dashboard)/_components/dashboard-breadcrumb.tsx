"use client";

import { skipToken } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";

const LABELS: Record<string, string> = {
	categories: "Categories",
	dashboard: "Dashboard",
	jobs: "Jobs",
	loans: "Loans",
	review: "Review Queue",
	settings: "Settings",
};

function useLoanLabel(segments: string[]) {
	const loanId = segments[0] === "loans" ? segments[1] : undefined;
	const { data } = api.loans.get.useQuery(loanId ? { id: loanId } : skipToken);
	return data?.loanNumber ?? null;
}

function useJobLabel(segments: string[]) {
	const jobId = segments[0] === "jobs" ? segments[1] : undefined;
	const { data } = api.jobs.getStatus.useQuery(jobId ? { jobId } : skipToken);
	return data?.sourceFileName ?? null;
}

export function DashboardBreadcrumb() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);
	const loanLabel = useLoanLabel(segments);
	const jobLabel = useJobLabel(segments);

	if (segments.length === 0) return null;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{segments.map((segment, i) => {
					const href = `/${segments.slice(0, i + 1).join("/")}`;
					const isLast = i === segments.length - 1;
					let label = LABELS[segment] ?? segment;

					if (i === 1 && segments[0] === "loans" && loanLabel) {
						label = loanLabel;
					}
					if (i === 1 && segments[0] === "jobs" && jobLabel) {
						label = jobLabel;
					}

					return (
						<React.Fragment key={href}>
							{i > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink render={<Link href={href} />}>
										{label}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
