"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";

interface Props {
	isPending: boolean;
	isValid: boolean;
	onAddSubtype: () => void;
	onClose: () => void;
	onSave: () => void;
}

export function EditorFooter({
	isPending,
	isValid,
	onAddSubtype,
	onClose,
	onSave,
}: Props) {
	return (
		<SheetFooter className="flex-row justify-between border-t">
			<Button onClick={onAddSubtype} size="sm" type="button" variant="outline">
				<HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
				Add Subtype
			</Button>
			<div className="flex gap-2">
				<Button onClick={onClose} type="button" variant="outline">
					Cancel
				</Button>
				<Button disabled={!isValid || isPending} onClick={onSave} type="button">
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</SheetFooter>
	);
}
