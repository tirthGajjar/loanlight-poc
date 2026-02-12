"use client";

import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/jobs/status-badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

const POLL_MS = 5000;
const TERMINAL = new Set(["CANCELLED", "COMPLETED", "FAILED"]);

export function JobsList() {
	const { data: jobs } = api.jobs.list.useQuery(undefined, {
		refetchInterval: (query) => {
			const list = query.state.data;
			if (!list) return false;
			return list.some((j) => !TERMINAL.has(j.status)) ? POLL_MS : false;
		},
	});

	return (
		<div className="space-y-6">
			<h1 className="font-semibold text-2xl tracking-tight">Jobs</h1>
			{jobs?.length === 0 && <EmptyState />}
			{jobs && jobs.length > 0 && <JobsTable jobs={jobs} />}
		</div>
	);
}

type JobItem = {
	_count: { segments: number };
	createdAt: Date;
	id: string;
	sourceFileName: string;
	status: string;
	totalPages: number | null;
};

function JobsTable({ jobs }: { jobs: JobItem[] }) {
	const router = useRouter();

	return (
		<div className="overflow-hidden rounded-xl border">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow className="hover:bg-muted/50">
						<TableHead>File</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Pages</TableHead>
						<TableHead className="text-right">Segments</TableHead>
						<TableHead className="text-right">Date</TableHead>
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
								{job.totalPages ?? "\u2014"}
							</TableCell>
							<TableCell className="text-right">
								{job._count.segments}
							</TableCell>
							<TableCell className="text-right text-muted-foreground">
								{job.createdAt.toLocaleDateString()}
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
		<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
			<HugeiconsIcon
				className="size-10 text-muted-foreground"
				icon={CloudUploadIcon}
				strokeWidth={1.5}
			/>
			<div>
				<p className="font-medium">No classification jobs yet</p>
				<p className="text-muted-foreground text-sm">
					Upload a document from a loan to start classifying
				</p>
			</div>
			<Link href="/loans">
				<Button>Go to Loans</Button>
			</Link>
		</div>
	);
}
