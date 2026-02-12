"use client";

import { CloudUploadIcon, FileSearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/jobs/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

const TERMINAL = new Set(["CANCELLED", "COMPLETED", "FAILED"]);

export function DashboardContent() {
	const { data, isLoading } = api.jobs.dashboardStats.useQuery(undefined, {
		refetchInterval: 30_000,
	});

	if (isLoading) return <DashboardSkeleton />;
	if (!data) return null;

	const totalJobs = data.jobsByStatus.reduce((sum, g) => sum + g._count, 0);
	const activeJobs = data.jobsByStatus
		.filter((g) => !TERMINAL.has(g.status))
		.reduce((sum, g) => sum + g._count, 0);
	const completedJobs =
		data.jobsByStatus.find((g) => g.status === "COMPLETED")?._count ?? 0;
	const failedJobs =
		data.jobsByStatus.find((g) => g.status === "FAILED")?._count ?? 0;

	if (totalJobs === 0) return <EmptyState />;

	return (
		<div className="space-y-6">
			<h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard
					detail={`${activeJobs} active, ${completedJobs} completed, ${failedJobs} failed`}
					label="Total Jobs"
					value={totalJobs}
				/>
				<StatCard
					detail="Jobs started this week"
					label="Recent (7d)"
					value={data.recentJobCount}
				/>
				<StatCard
					accent={data.reviewCount > 0}
					detail="Segments awaiting review"
					label="Needs Review"
					value={data.reviewCount}
				/>
				<StatCard
					detail="Across completed jobs"
					label="Pages Processed"
					value={data.totalPages}
				/>
			</div>

			{/* Quick Actions */}
			<div className="flex gap-3">
				<Link href="/loans">
					<Button size="sm" variant="secondary">
						<HugeiconsIcon icon={CloudUploadIcon} size={16} strokeWidth={1.5} />
						Upload Document
					</Button>
				</Link>
				<Link href="/jobs">
					<Button size="sm" variant="secondary">
						<HugeiconsIcon icon={FileSearchIcon} size={16} strokeWidth={1.5} />
						Review Queue
						{data.reviewCount > 0 && (
							<Badge className="ml-1" variant="default">
								{data.reviewCount}
							</Badge>
						)}
					</Button>
				</Link>
			</div>

			{/* Recent Activity */}
			<div className="space-y-3">
				<h2 className="font-medium text-lg">Recent Activity</h2>
				{data.recentActivity.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						No completed jobs yet. Upload a document to get started.
					</p>
				) : (
					<ActivityTable jobs={data.recentActivity} />
				)}
			</div>
		</div>
	);
}

function StatCard({
	label,
	value,
	detail,
	accent,
}: {
	label: string;
	value: number;
	detail: string;
	accent?: boolean;
}) {
	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle className="font-normal text-muted-foreground text-sm">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p
					className={`font-semibold text-2xl ${accent ? "text-amber-600 dark:text-amber-400" : ""}`}
				>
					{value.toLocaleString()}
				</p>
				<p className="mt-1 text-muted-foreground text-xs">{detail}</p>
			</CardContent>
		</Card>
	);
}

type ActivityJob = {
	_count: { segments: number };
	completedAt: Date | null;
	id: string;
	sourceFileName: string;
	startedAt: Date | null;
	status: string;
};

function ActivityTable({ jobs }: { jobs: ActivityJob[] }) {
	const router = useRouter();

	return (
		<div className="overflow-hidden rounded-xl border">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow className="hover:bg-muted/50">
						<TableHead>File</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Segments</TableHead>
						<TableHead className="text-right">Duration</TableHead>
						<TableHead className="text-right">Completed</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{jobs.map((job) => (
						<TableRow
							className="cursor-pointer"
							key={job.id}
							onClick={() => router.push(`/jobs/${job.id}`)}
						>
							<TableCell className="font-medium">
								{job.sourceFileName}
							</TableCell>
							<TableCell>
								<StatusBadge status={job.status} />
							</TableCell>
							<TableCell className="text-right">
								{job._count.segments}
							</TableCell>
							<TableCell className="text-right text-muted-foreground">
								{formatDuration(job.startedAt, job.completedAt)}
							</TableCell>
							<TableCell className="text-right text-muted-foreground">
								{job.completedAt
									? formatRelativeTime(job.completedAt)
									: "\u2014"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="space-y-6">
			<h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
			<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
				<HugeiconsIcon
					className="size-10 text-muted-foreground"
					icon={CloudUploadIcon}
					strokeWidth={1.5}
				/>
				<div>
					<p className="font-medium">Welcome to LoanLight</p>
					<p className="text-muted-foreground text-sm">
						Upload your first document to start classifying
					</p>
				</div>
				<Link href="/loans">
					<Button>Go to Loans</Button>
				</Link>
			</div>
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-40" />
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Skeleton className="h-28 rounded-2xl" />
				<Skeleton className="h-28 rounded-2xl" />
				<Skeleton className="h-28 rounded-2xl" />
				<Skeleton className="h-28 rounded-2xl" />
			</div>
			<div className="flex gap-3">
				<Skeleton className="h-9 w-40" />
				<Skeleton className="h-9 w-36" />
			</div>
			<Skeleton className="h-64 rounded-xl" />
		</div>
	);
}

function formatDuration(start: Date | null, end: Date | null): string {
	if (!(start && end)) return "\u2014";
	const ms = new Date(end).getTime() - new Date(start).getTime();
	if (ms < 1000) return "<1s";
	const seconds = Math.floor(ms / 1000);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes}m`;
}

function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const ms = now - new Date(date).getTime();
	const seconds = Math.floor(ms / 1000);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(date).toLocaleDateString();
}
