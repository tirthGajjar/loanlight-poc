import Link from "next/link";
import { Button } from "@/components/ui/button";

type AuthMessageProps = {
	icon: React.ReactNode;
	iconClassName?: string;
	title: string;
	description: React.ReactNode;
	action: { label: string; href: string; variant?: "default" | "outline" };
};

export function AuthMessage({
	icon,
	iconClassName = "bg-muted",
	title,
	description,
	action,
}: AuthMessageProps) {
	return (
		<div>
			<div
				className={`mb-2 flex size-12 items-center justify-center rounded-2xl ${iconClassName}`}
			>
				{icon}
			</div>

			<div className="mt-5 mb-8">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
				<p className="mt-1.5 text-muted-foreground text-sm">{description}</p>
			</div>

			<Link href={action.href}>
				<Button
					className="w-full"
					size="lg"
					variant={action.variant ?? "default"}
				>
					{action.label}
				</Button>
			</Link>
		</div>
	);
}
