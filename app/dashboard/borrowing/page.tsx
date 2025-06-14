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
import { columns as rawColumns } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";
import { getCookie } from "cookies-next";
import Borrow from "@/components/borrowing-data";

// Perbarui tipe Borrowing sesuai response API
export type Borrowing = {
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
  user: {
    id: number;
    username: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
  item: {
    id: number;
    sku: string;
    name: string;
    image_url: string;
    stock: number;
    created_at: string;
    updated_at: string;
  };
};

async function getBorrowing(): Promise<Borrowing[]> {
  const token = getCookie("token");
  const url = process.env.NEXT_PUBLIC_API_URL;
  const res = await axios.get(`${url}/api/admin/borrows`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export default function Borrowing() {
  const [data, setData] = React.useState<Borrowing[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const refreshData = () => {
    getBorrowing().then(setData).catch(console.error);
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const columns = rawColumns(refreshData);

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
                {/* Ubah breadcrumb */}
                <BreadcrumbItem>
                  <BreadcrumbPage>Borrowings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="">
            <Borrow />
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
