"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  Container,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"


const data = {
  user: {
    name: "Admin",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: Container,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: SquareTerminal,
    },
    {
      title: "Items",
      url: "#",
      icon: Bot,
    },
    {
      title: "Borrows",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Returns",
      url: "#",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h1 className="ml-2 font-bold text-xl cursor-pointer">
          <Link href={"/dashboard"}>SISFO SARPRAS</Link>
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
