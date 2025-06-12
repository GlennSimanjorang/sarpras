"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
import { getCookie } from "cookies-next";


interface DashboardData {
  total_items: number;
  total_users: number;
  total_borrowings: number;
  total_returnings: number;
  total_categories: number;
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    const url = process.env.NEXT_PUBLIC_API_URL;
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          `${url}/api/admin/dashboard/count`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.data) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        setError("Gagal memuat data dashboard");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const stats = [
    { title: "Total Items", value: dashboardData?.total_items },
    { title: "Total Users", value: dashboardData?.total_users },
    { title: "Total Borrowings", value: dashboardData?.total_borrowings },
    { title: "Total Returnings", value: dashboardData?.total_returnings },
    { title: "Total Categories", value: dashboardData?.total_categories },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <>
              <div className="grid auto-rows-min gap-4 grid-cols-2 md:grid-cols-5">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center"
                  >
                    <h3 className="text-lg font-semibold text-gray-600">
                      {stat.title}
                    </h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                      {stat.value ?? "-"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-white border min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
