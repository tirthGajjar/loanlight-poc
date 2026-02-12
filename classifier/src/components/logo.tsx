import Image from "next/image";

export function Logo({
	className,
	variant = "light",
}: {
	className?: string;
	variant?: "dark" | "light";
}) {
	return (
		<Image
			alt="LoanLight"
			className={className}
			height={40}
			src={variant === "light" ? "/logo.svg" : "/logo-dark.svg"}
			width={166}
		/>
	);
}
