"use client";

import {
	BankIcon,
	Building03Icon,
	CloudUploadIcon,
	CreditCardIcon,
	DashboardSquare01Icon,
	DollarSquareIcon,
	FileSearchIcon,
	FileValidationIcon,
	Home01Icon,
	Settings05Icon,
	TaskDaily01Icon,
	TaxesIcon,
	UserIdVerificationIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/server/better-auth/client";

const data = {
	teams: [
		{
			name: "LoanLight",
			logo: <HugeiconsIcon icon={FileSearchIcon} strokeWidth={2} />,
			plan: "Document Classification",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
			isActive: true,
		},
		{
			title: "Classify",
			url: "/loans",
			icon: <HugeiconsIcon icon={CloudUploadIcon} strokeWidth={2} />,
			items: [
				{
					title: "Loans",
					url: "/loans",
				},
				{
					title: "Jobs",
					url: "/jobs",
				},
			],
		},
		{
			title: "Review Queue",
			url: "/review",
			icon: <HugeiconsIcon icon={FileSearchIcon} strokeWidth={2} />,
		},
		{
			title: "Activity Log",
			url: "/activity",
			icon: <HugeiconsIcon icon={TaskDaily01Icon} strokeWidth={2} />,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
			items: [
				{
					title: "General",
					url: "/settings",
				},
				{
					title: "Categories",
					url: "/settings/categories",
				},
				{
					title: "Account",
					url: "/settings/account",
				},
			],
		},
	],
	categories: [
		{
			name: "Income",
			url: "/documents?bucket=income",
			icon: <HugeiconsIcon icon={DollarSquareIcon} strokeWidth={2} />,
		},
		{
			name: "Assets",
			url: "/documents?bucket=assets",
			icon: <HugeiconsIcon icon={BankIcon} strokeWidth={2} />,
		},
		{
			name: "Tax Returns",
			url: "/documents?bucket=tax_returns",
			icon: <HugeiconsIcon icon={TaxesIcon} strokeWidth={2} />,
		},
		{
			name: "Property",
			url: "/documents?bucket=property",
			icon: <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />,
		},
		{
			name: "Credit",
			url: "/documents?bucket=credit",
			icon: <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />,
		},
		{
			name: "Identity",
			url: "/documents?bucket=identity",
			icon: <HugeiconsIcon icon={UserIdVerificationIcon} strokeWidth={2} />,
		},
		{
			name: "Disclosures",
			url: "/documents?bucket=disclosures",
			icon: <HugeiconsIcon icon={FileValidationIcon} strokeWidth={2} />,
		},
		{
			name: "Business",
			url: "/documents?bucket=business",
			icon: <HugeiconsIcon icon={Building03Icon} strokeWidth={2} />,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();

	const user = {
		name: session?.user?.name ?? "User",
		email: session?.user?.email ?? "",
		image: session?.user?.image ?? undefined,
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavProjects projects={data.categories} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
