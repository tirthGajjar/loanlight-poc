"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { NewLoanDialog } from "./upload-sheet";

export function LoansList() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const { data: loans } = api.loans.list.useQuery();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="font-semibold text-2xl tracking-tight">Loans</h1>
				<Button onClick={() => setSheetOpen(true)}>
					<HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
					New Loan
				</Button>
			</div>
			{loans?.length === 0 && (
				<EmptyState onAction={() => setSheetOpen(true)} />
			)}
			{loans && loans.length > 0 && <LoanCards loans={loans} />}
			<NewLoanDialog onOpenChange={setSheetOpen} open={sheetOpen} />
		</div>
	);
}

type LoanItem = {
	_count: { classificationJobs: number };
	createdAt: Date;
	id: string;
	loanNumber: string;
};

function LoanCards({ loans }: { loans: LoanItem[] }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{loans.map((loan) => (
				<Link href={`/loans/${loan.id}`} key={loan.id}>
					<Card className="transition-colors hover:bg-muted/30" size="sm">
						<CardHeader>
							<CardTitle>{loan.loanNumber}</CardTitle>
							<CardDescription className="flex items-center gap-2">
								<Badge variant="outline">
									{loan._count.classificationJobs} job
									{loan._count.classificationJobs !== 1 && "s"}
								</Badge>
								<span>{loan.createdAt.toLocaleDateString()}</span>
							</CardDescription>
						</CardHeader>
					</Card>
				</Link>
			))}
		</div>
	);
}

function EmptyState({ onAction }: { onAction: () => void }) {
	return (
		<div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
			<HugeiconsIcon
				className="size-10 text-muted-foreground"
				icon={Add01Icon}
				strokeWidth={1.5}
			/>
			<div>
				<p className="font-medium">No loans yet</p>
				<p className="text-muted-foreground text-sm">
					Create your first loan to start uploading documents
				</p>
			</div>
			<Button onClick={onAction}>New Loan</Button>
		</div>
	);
}
