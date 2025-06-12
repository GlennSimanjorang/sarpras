"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { columns } from "./colums";
import { DataTable } from "./data-table";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import UserCreate from "@/components/user-crate";

export type User = {
  id: number;
  username: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

async function getUsers(): Promise<User[]> {
  const token = getCookie("token");
  const url = process.env.NEXT_PUBLIC_API_URL;
  const res = await axios.get(`${url}/api/admin/users`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const refreshData = () => {
    getUsers().then(setData).catch(console.error);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between px-4 ">
          <div className="flex items-center space-x-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Users</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <UserCreate onSuccess={refreshData} />
        </header>
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable columns={columns(refreshData)} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
