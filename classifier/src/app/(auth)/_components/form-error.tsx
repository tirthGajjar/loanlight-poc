export function FormError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive text-sm">
			{message}
		</div>
	);
}
