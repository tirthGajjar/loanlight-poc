"use client";

import { Suspense } from "react";
import { ResetForm } from "./_components/reset-form";

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div>
					<div className="mb-8">
						<h1 className="font-semibold text-2xl tracking-tight">
							Reset password
						</h1>
						<p className="mt-1.5 text-muted-foreground text-sm">Loading...</p>
					</div>
				</div>
			}
		>
			<ResetForm />
		</Suspense>
	);
}
