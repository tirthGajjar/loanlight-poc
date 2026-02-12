"use client";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SubtypeData } from "./types";

const DESC_TRUNCATE = 60;

function truncate(text: string, max = DESC_TRUNCATE) {
	return text.length > max ? `${text.slice(0, max)}...` : text;
}

interface Props {
	subtypes: SubtypeData[];
}

export function SubtypesTable({ subtypes }: Props) {
	return (
		<Table>
			<TableHeader className="bg-muted/50">
				<TableRow className="hover:bg-muted/50">
					<TableHead>Type</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Encompass Folder</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{subtypes.length === 0 && (
					<TableRow>
						<TableCell
							className="text-center text-muted-foreground"
							colSpan={3}
						>
							No subtypes defined
						</TableCell>
					</TableRow>
				)}
				{subtypes.map((s) => (
					<SubtypeRow key={s.id} subtype={s} />
				))}
			</TableBody>
		</Table>
	);
}

function SubtypeRow({ subtype }: { subtype: SubtypeData }) {
	const needsTruncation = subtype.description.length > DESC_TRUNCATE;

	return (
		<TableRow>
			<TableCell>
				<Badge className="font-mono" variant="outline">
					{subtype.type}
				</Badge>
			</TableCell>
			<TableCell className="text-muted-foreground text-xs">
				{needsTruncation ? (
					<Tooltip>
						<TooltipTrigger className="cursor-default text-left">
							{truncate(subtype.description)}
						</TooltipTrigger>
						<TooltipContent side="bottom">{subtype.description}</TooltipContent>
					</Tooltip>
				) : (
					subtype.description
				)}
			</TableCell>
			<TableCell>{subtype.encompassFolder}</TableCell>
		</TableRow>
	);
}
