import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { Landing } from "./_components/landing";

export default async function Home() {
	const session = await getSession();
	if (session) {
		redirect("/dashboard");
	}

	return <Landing />;
}
