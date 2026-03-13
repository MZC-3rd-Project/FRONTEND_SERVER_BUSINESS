import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { AuthButtons } from "@/components/user/authButton";
import { UserNavigation } from "@/components/user/UserNavigation";
import {useEffect, useState} from "react";

const menus = [
    {
        name: "Products",
        to: "/products",
        items: [
            {
                name: "Leaderboards",
                description: "See the top performers in your community",
                to: "/products/leaderboards",
            },
            {
                name: "Categories",
                description: "See the top categories in your community",
                to: "/products/categories",
            },
            {
                name: "Search",
                description: "Search for a product",
                to: "/products/search",
            },
            {
                name: "Submit a Product",
                description: "Submit a product to our community",
                to: "/products/submit",
            },
            {
                name: "Promote",
                description: "Promote a product to our community",
                to: "/products/promote",
            },
        ],
    },
    {
        name: "Jobs",
        to: "/jobs",
        items: [
            {
                name: "Remote Jobs",
                description: "Find a remote job in our community",
                to: "/jobs?location=remote",
            },
            {
                name: "Full-Time Jobs",
                description: "Find a full-time job in our community",
                to: "/jobs?type=full-time",
            },
            {
                name: "Freelance Jobs",
                description: "Find a freelance job in our community",
                to: "/jobs?type=freelance",
            },
            {
                name: "Internships",
                description: "Find an internship in our community",
                to: "/jobs?type=internship",
            },
            {
                name: "Submit a Job",
                description: "Submit a job to our community",
                to: "/jobs/submit",
            },
        ],
    },
    {
        name: "Community",
        to: "/community",
        items: [
            {
                name: "All Posts",
                description: "See all posts in our community",
                to: "/community",
            },
            {
                name: "Top Posts",
                description: "See the top posts in our community",
                to: "/community?sort=top",
            },
            {
                name: "New Posts",
                description: "See the new posts in our community",
                to: "/community?sort=new",
            },
            {
                name: "Create a Post",
                description: "Create a post in our community",
                to: "/community/create",
            },
        ],
    },
    {
        name: "IdeasGPT",
        to: "/ideas",
    },
    {
        name: "Teams",
        to: "/teams",
        items: [
            {
                name: "All Teams",
                description: "See all teams in our community",
                to: "/teams",
            },
            {
                name: "Create a Team",
                description: "Create a team in our community",
                to: "/teams/create",
            },
        ],
    },
];

export default function Header({
                                   isLoggedIn,
                                   hasNotifications,
                                   hasMessages,
                               }
) {

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={cn(
            "flex px-20 h-16 items-center justify-between fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled
                ? "bg-background/80 backdrop-blur border-b border-border shadow-sm"
                : "bg-primary"
        )}>
            <div className="flex items-center">
                <Link
                    to="/"
                    className={cn(
                        "font-bold tracking-tighter text-lg transition-colors",
                        isScrolled ? "text-foreground" : "text-primary-foreground"
                    )}
                >
                    로고
                </Link>
                <Separator
                    orientation="vertical"
                    className={cn(
                        "h-6 mx-4",
                        !isScrolled && "bg-primary-foreground/30"
                    )}
                />
                <NavigationMenu>
                    <NavigationMenuList>
                        {menus.map((menu) => (
                            <NavigationMenuItem key={menu.name}>
                                {menu.items ? (
                                    <>
                                        <Link to={menu.to}>
                                            <NavigationMenuTrigger
                                                className={cn(
                                                    !isScrolled && "text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:text-primary-foreground data-[state=open]:bg-primary-foreground/10"
                                                )}
                                            >
                                                {menu.name}
                                            </NavigationMenuTrigger>
                                        </Link>
                                        <NavigationMenuContent>
                                            <ul className="grid gap-3 p-4 w-[600px] font-light grid-cols-2 ">
                                                {menu.items?.map((item) => (
                                                    <NavigationMenuItem
                                                        key={item.name}
                                                        className={cn(
                                                            "p-3 rounded-md transition-colors hover:bg-accent focus:bg-accent",
                                                        )}
                                                    >
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                className="space-y-1 no-underline outline-none leading-none"
                                                                to={item.to}
                                                            >
                                                                <span className="text-sm font-medium leading-none">
                                                                    {item.name}
                                                                </span>
                                                                <p className="text-sm leading-snug text-muted-foreground">
                                                                    {item.description}
                                                                </p>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </NavigationMenuItem>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <Link
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            !isScrolled && "text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                        )}
                                        to={menu.to}
                                    >
                                        {menu.name}
                                    </Link>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {isLoggedIn ? (
                <UserNavigation
                    hasNotifications={hasNotifications}
                    hasMessages={hasMessages}
                />
            ) : (
                <AuthButtons />
            )}
        </nav>
    );
}