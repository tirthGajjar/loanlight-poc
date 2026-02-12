export function AuthHeader({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="mb-8">
			<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
			<p className="mt-1.5 text-muted-foreground text-sm">{description}</p>
		</div>
	);
}
