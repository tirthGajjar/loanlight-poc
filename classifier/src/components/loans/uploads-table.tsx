"use client";

import {
	Cancel01Icon,
	EyeIcon,
	MoreVerticalIcon,
	RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { StatusBadge } from "@/components/jobs/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api, type RouterOutputs } from "@/trpc/react";

type Job = RouterOutputs["loans"]["get"]["classificationJobs"][number];

const IN_PROGRESS = new Set([
	"PENDING",
	"INGESTING",
	"SPLITTING",
	"CLASSIFYING",
	"FINALIZING",
]);

function formatSize(bytes: number | null) {
	if (!bytes) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadsTable({ jobs }: { jobs: Job[] }) {
	if (jobs.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground text-sm">
					No documents uploaded yet
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Uploads</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow className="hover:bg-muted/50">
							<TableHead>File</TableHead>
							<TableHead className="text-right">Size</TableHead>
							<TableHead className="text-right">Pages</TableHead>
							<TableHead className="text-right">Docs Found</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Uploaded</TableHead>
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobs.map((job) => (
							<TableRow key={job.id}>
								<TableCell className="font-medium">
									<Link className="hover:underline" href={`/jobs/${job.id}`}>
										{job.sourceFileName}
									</Link>
								</TableCell>
								<TableCell className="text-right text-muted-foreground">
									{formatSize(job.sourceSizeBytes)}
								</TableCell>
								<TableCell className="text-right text-muted-foreground">
									{job.totalPages ?? "—"}
								</TableCell>
								<TableCell className="text-right text-muted-foreground">
									{job._count.segments || "—"}
								</TableCell>
								<TableCell>
									<StatusBadge status={job.status} />
								</TableCell>
								<TableCell className="text-right text-muted-foreground">
									{job.createdAt.toLocaleDateString()}
								</TableCell>
								<TableCell>
									<RowActions job={job} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function RowActions({ job }: { job: Job }) {
	const utils = api.useUtils();
	const cancel = api.jobs.cancel.useMutation({
		onSuccess: () => utils.loans.get.invalidate({ id: job.loanId }),
	});
	const retry = api.jobs.retry.useMutation({
		onSuccess: () => utils.loans.get.invalidate({ id: job.loanId }),
	});

	const canCancel = IN_PROGRESS.has(job.status);
	const canRetry = job.status === "FAILED" || job.status === "CANCELLED";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
				<HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem render={<Link href={`/jobs/${job.id}`} />}>
					<HugeiconsIcon icon={EyeIcon} strokeWidth={2} />
					View Details
				</DropdownMenuItem>
				{canRetry && (
					<DropdownMenuItem onClick={() => retry.mutate({ jobId: job.id })}>
						<HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
						Retry
					</DropdownMenuItem>
				)}
				{canCancel && (
					<DropdownMenuItem
						onClick={() => cancel.mutate({ jobId: job.id })}
						variant="destructive"
					>
						<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
						Cancel
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
