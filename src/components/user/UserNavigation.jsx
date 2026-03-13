import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, BellIcon, LogOutIcon, MessageCircleIcon, SettingsIcon, UserIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function UserNavigation({
                                   hasNotifications,
                                   hasMessages,
                               }) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/my/notifications">
                    <BellIcon className="size-4" />
                    {hasNotifications && (
                        <div className="absolute top-1.5 right-1.5 inline-flex items-center justify-center size-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {hasNotifications}
                        </div>
                    )}
                </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/my/messages">
                    <MessageCircleIcon className="size-4" />
                    {hasMessages && (
                        <div className="absolute top-1.5 right-1.5 inline-flex items-center justify-center text-xs size-2 font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {hasMessages}
                        </div>
                    )}
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar>
                        <AvatarImage src="https://github.com/ANchangwan.png" />
                        <AvatarFallback>
                            <span className="text-xs">Loading...</span>
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="flex flex-col gap-1">
                        <span className="font-medium">John Doe</span>
                        <span className="text-xs text-muted-foreground">@username</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/dashboard">
                                <BarChart3Icon className="size-4 mr-2"></BarChart3Icon>
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/profile">
                                <UserIcon className="size-4 mr-2" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/settings">
                                <SettingsIcon className="size-4 mr-2" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/logout">
                                <LogOutIcon className="size-4 mr-2" />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}