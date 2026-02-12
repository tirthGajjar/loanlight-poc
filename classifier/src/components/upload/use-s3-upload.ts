export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function uploadToS3(
	url: string,
	file: File,
	xhrRef: React.RefObject<XMLHttpRequest | null>,
	onProgress: (pct: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhrRef.current = xhr;

		let lastReported = -1;
		xhr.upload.addEventListener("progress", (e) => {
			if (!e.lengthComputable) return;
			const pct = Math.round((e.loaded / e.total) * 100);
			if (pct - lastReported >= 5 || pct === 100) {
				lastReported = pct;
				onProgress(pct);
			}
		});
		xhr.addEventListener("load", () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(new Error("Upload failed. Please try again."));
		});
		xhr.addEventListener("error", () =>
			reject(new Error("Network error during upload.")),
		);
		xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

		xhr.open("PUT", url);
		xhr.setRequestHeader("Content-Type", file.type);
		xhr.send(file);
	});
}
