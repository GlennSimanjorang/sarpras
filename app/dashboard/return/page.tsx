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
import { columns } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";
import { getCookie } from "cookies-next";
import Returning from "@/components/returning-data";

// Tipe data untuk Returned Item
export type ReturnItem = {
  id: number;
  borrow_id: number;
  returned_quantity: number;
  handled_by: number | null;
  created_at: string;
  updated_at: string;
  borrowing: {
    id: number;
    item_id: number;
    user_id: number;
    quantity: number;
    status: string;
    approved_by: number | null;
    approved_at: string | null;
    due_date: string;
    created_at: string;
    updated_at: string;
    item: {
      id: number;
      sku: string;
      name: string;
      image_url: string;
      stock: number;
      created_at: string;
      updated_at: string;
    };
    user: {
      id: number;
      username: string;
      last_login_at: string;
      created_at: string;
      updated_at: string;
    };
  };
};

async function getReturnedItems(): Promise<ReturnItem[]> {
  const token = getCookie("token");
  const url = process.env.NEXT_PUBLIC_API_URL;
  const res = await axios.get(`${url}/api/admin/returns`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export default function ReturnsPage() {
  const [data, setData] = React.useState<ReturnItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const refreshData = () => {
    getReturnedItems()
      .then(setData)
      .catch((error) => {
        console.error("Error fetching returns:", error);
        setError("Failed to fetch returns data");
      });
  };

  React.useEffect(() => {
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
                  <BreadcrumbPage>Returns</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="">
            <Returning  />
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="container mx-auto">
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <DataTable columns={columns(refreshData)} data={data} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
