export const DocumentIcon = ({ className }: { className?: string }) => (
	<svg
		aria-hidden="true"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const LayersIcon = ({ className }: { className?: string }) => (
	<svg
		aria-hidden="true"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
	<svg
		aria-hidden="true"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={1.5}
		viewBox="0 0 24 24"
	>
		<path
			d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const ArrowRightIcon = ({ className }: { className?: string }) => (
	<svg
		aria-hidden="true"
		className={className}
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		viewBox="0 0 24 24"
	>
		<path
			d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const FEATURES = [
	{
		num: "1",
		title: "Upload PDF",
		desc: "Up to 50MB consolidated documents",
		icon: DocumentIcon,
	},
	{
		num: "2",
		title: "Auto-Classify",
		desc: "47 document types across 8 categories",
		icon: LayersIcon,
	},
	{
		num: "3",
		title: "Download",
		desc: "Individual PDFs ready for Encompass",
		icon: DownloadIcon,
	},
];
