import { task } from "@trigger.dev/sdk";

export const helloWorldTask = task({
	id: "hello-world",
	run: async (payload: { message: string }) => {
		console.log("Hello from Trigger.dev!", payload.message);
		return { success: true, timestamp: Date.now() };
	},
});
