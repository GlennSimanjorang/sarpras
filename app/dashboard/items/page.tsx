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
import { z } from "zod";
import { useEffect, useState } from "react";
import ItemsCreate from "@/components/items-create";

export type Items = {
  id: number;
  sku: string;
  name: string;
  image_url: string;
  stock: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

async function getItems(): Promise<Items[]> {
  const token = getCookie("token");
  const url = process.env.NEXT_PUBLIC_API_URL
  const res = await axios.get(`${url}/api/admin/items`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

export default function Categories() {
  const [data, setData] = useState<Items[]>([]);
  const refreshData = () => {
    getItems().then(setData).catch(console.error);
  };
  useEffect(() => {
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Items</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ItemsCreate refreshData={refreshData} />
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
