'use client';

import * as React from "react";
import Link from 'next/link';
import { GitBranch, Search, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useParams } from 'next/navigation';
import { useSites } from '@/components/SitesProvider';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 mt-1 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
});
ListItem.displayName = "ListItem";

export function Navbar() {
  const params = useParams();
  const { sites } = useSites();
  const [searchQuery, setSearchQuery] = React.useState("");
  const { setTheme } = useTheme();

  const filteredSites = sites.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Impact Index
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Sites</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] md:w-[500px] lg:w-[600px]">
                      <div className="p-4 pb-0">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search sites..."
                            className="w-full rounded-md border border-input bg-transparent pl-9 pr-4 py-2 text-sm outline-none focus:border-accent transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="p-4 h-[300px] overflow-y-auto">
                        <ul className="grid gap-3 md:grid-cols-2">
                          {filteredSites.map((site) => (
                            <ListItem
                              key={site.name}
                              title={site.name}
                              href={`/${site.name}`}
                              className={cn(
                                "hover:bg-accent/50 transition-colors duration-150",
                                params.siteId === site.name && "text-blue-400 bg-accent/20"
                              )}
                            />
                          ))}
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger showChevron={false}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[120px] gap-3 p-4">
                      <ListItem 
                        title="Light"
                        onClick={() => setTheme("light")}
                        className="cursor-pointer"
                      />
                      <ListItem 
                        title="Dark"
                        onClick={() => setTheme("dark")}
                        className="cursor-pointer"
                      />
                      <ListItem 
                        title="System"
                        onClick={() => setTheme("system")}
                        className="cursor-pointer"
                      />
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Button 
              asChild 
              variant="outline" 
              size="sm" 
              className="hidden md:flex bg-[#24292e] hover:bg-[#2f363d] text-white border-[#1b1f23] hover:border-[#1b1f23]"
            >
              <a
                href="https://github.com/critique-ai/impact-index"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <GitBranch className="mr-2 h-4 w-4" />
                <span>Code on GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 