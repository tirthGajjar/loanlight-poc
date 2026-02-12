"use client";

import { Badge } from "@/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { statusVariant } from "./status-variant";

interface Props {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function HistorySheet({ onOpenChange, open }: Props) {
	const { data: versions, isLoading } = api.categories.listVersions.useQuery(
		undefined,
		{ enabled: open },
	);

	return (
		<Sheet onOpenChange={onOpenChange} open={open}>
			<SheetContent className="sm:min-w-[40%]" side="right">
				<SheetHeader>
					<SheetTitle>Version History</SheetTitle>
					<SheetDescription>
						All published and archived versions of your category definitions.
					</SheetDescription>
				</SheetHeader>
				<div className="overflow-y-auto px-6">
					{isLoading && (
						<p className="py-4 text-muted-foreground text-sm">Loading...</p>
					)}
					{versions && versions.length === 0 && (
						<p className="py-4 text-muted-foreground text-sm">
							No versions yet.
						</p>
					)}
					{versions && versions.length > 0 && (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Version</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Categories</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>By</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{versions.map((v) => (
									<TableRow key={v.id}>
										<TableCell className="font-medium">v{v.version}</TableCell>
										<TableCell>
											<Badge variant={statusVariant(v.status)}>
												{v.status}
											</Badge>
										</TableCell>
										<TableCell>{v._count.categories}</TableCell>
										<TableCell>
											{v.publishedAt
												? new Date(v.publishedAt).toLocaleDateString()
												: "---"}
										</TableCell>
										<TableCell>
											{v.publishedBy?.name ?? v.createdBy.name}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
