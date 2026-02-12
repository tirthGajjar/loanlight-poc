"use client";

import {
	ArrowDown01Icon,
	ArrowUp01Icon,
	Delete02Icon,
	MoreVerticalIcon,
	PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtypesTable } from "./subtypes-table";
import type { SubtypeData } from "./types";

const DESC_LINE_LIMIT = 2;

interface Props {
	description: string;
	isDraft: boolean;
	isFirst: boolean;
	isLast: boolean;
	name: string;
	onDeleteCategory?: () => void;
	onEditCategory?: () => void;
	onMoveDown?: () => void;
	onMoveUp?: () => void;
	subtypes: SubtypeData[];
}

export function CategoryCard({
	description,
	isDraft,
	isFirst,
	isLast,
	name,
	onDeleteCategory,
	onEditCategory,
	onMoveDown,
	onMoveUp,
	subtypes,
}: Props) {
	const [expanded, setExpanded] = useState(false);
	const lines = description.split("\n");
	const isTruncated = lines.length > DESC_LINE_LIMIT;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<CardTitle>{name}</CardTitle>
					<Badge variant="secondary">
						{subtypes.length} subtype{subtypes.length !== 1 && "s"}
					</Badge>
				</div>
				{isDraft && (
					<CardAction>
						<div className="flex items-center gap-0.5">
							<Button
								disabled={isFirst}
								onClick={onMoveUp}
								size="icon-sm"
								type="button"
								variant="ghost"
							>
								<HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
							</Button>
							<Button
								disabled={isLast}
								onClick={onMoveDown}
								size="icon-sm"
								type="button"
								variant="ghost"
							>
								<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={<Button size="icon-sm" variant="ghost" />}
								>
									<HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={onEditCategory}>
										<HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
										Edit Category
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={onDeleteCategory}
										variant="destructive"
									>
										<HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
										Delete Category
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				<p
					className={`whitespace-pre-wrap text-muted-foreground text-sm ${
						!expanded && isTruncated ? "line-clamp-2" : ""
					}`}
				>
					{description}
				</p>
				{isTruncated && (
					<button
						className="mt-1 cursor-pointer text-primary text-xs hover:underline"
						onClick={() => setExpanded(!expanded)}
						type="button"
					>
						{expanded ? "Show less" : "Show more"}
					</button>
				)}
			</CardContent>
			<CardContent className="p-0">
				<SubtypesTable subtypes={subtypes} />
			</CardContent>
		</Card>
	);
}
