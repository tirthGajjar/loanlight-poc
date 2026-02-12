"use client";

import {
	CheckmarkBadgeIcon,
	LogoutIcon,
	NotificationIcon,
	UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/server/better-auth/client";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		image?: string;
	};
}) {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const initials = getInitials(user.name);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton className="aria-expanded:bg-muted" size="lg" />
						}
					>
						<Avatar>
							{user.image && <AvatarImage alt={user.name} src={user.image} />}
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{user.name}</span>
							<span className="truncate text-xs">{user.email}</span>
						</div>
						<HugeiconsIcon
							className="ml-auto size-4"
							icon={UnfoldMoreIcon}
							strokeWidth={2}
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar>
										{user.image && (
											<AvatarImage alt={user.name} src={user.image} />
										)}
										<AvatarFallback>{initials}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<HugeiconsIcon icon={CheckmarkBadgeIcon} strokeWidth={2} />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<HugeiconsIcon icon={NotificationIcon} strokeWidth={2} />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
