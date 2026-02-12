import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function AuthFooter({
	href,
	label,
	linkText,
}: {
	href: string;
	label: string;
	linkText: string;
}) {
	return (
		<>
			<div className="mt-8">
				<Separator />
			</div>
			<p className="mt-6 text-center text-muted-foreground text-sm">
				{label}{" "}
				<Link
					className="font-medium text-foreground transition-colors hover:text-foreground/80"
					href={href}
				>
					{linkText}
				</Link>
			</p>
		</>
	);
}
