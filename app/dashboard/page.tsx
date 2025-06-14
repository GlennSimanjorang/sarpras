"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCookie } from "cookies-next";
import Links from "next/link";
import { Link } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DueDateChart } from "@/components/chart"; 

interface DueDateSummary {
  due_date: string;
  items_due: string;
}

interface DashboardData {
  total_items: number;
  total_users: number;
  total_borrowings: number;
  total_returnings: number;
  total_categories: number;
  due_date_summary: DueDateSummary[];
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("90d");

  useEffect(() => {
    const token = getCookie("token");
    const url = process.env.NEXT_PUBLIC_API_URL;
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${url}/api/admin/dashboard/count`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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

  const chartData = React.useMemo(() => {
    if (!dashboardData?.due_date_summary) return [];

    return dashboardData.due_date_summary.map((item) => ({
      due_date: item.due_date,
      items_due: parseInt(item.items_due),
    }));
  }, [dashboardData]);

  const filteredChartData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    const sortedData = [...chartData].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    const referenceDate = new Date(sortedData[sortedData.length - 1].due_date);
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return sortedData.filter((item) => new Date(item.due_date) >= startDate);
  }, [chartData, timeRange]);

  const stats = [
    {
      title: "Total Items",
      value: dashboardData?.total_items,
      text: "All items that are owned",
      link: "/dashboard/items",
    },
    {
      title: "Total Users",
      value: dashboardData?.total_users,
      text: "Registered users in the system",
      link: "/dashboard/users",
    },
    {
      title: "Total Borrowings",
      value: dashboardData?.total_borrowings,
      text: "Total items borrowed",
      link: "/dashboard/borrowing",
    },
    {
      title: "Total Returnings",
      value: dashboardData?.total_returnings,
      text: "Total items returned",
      link: "/dashboard/return",
    },
    {
      title: "Total Categories",
      value: dashboardData?.total_categories,
      text: "All item categories",
      link: "/dashboard/categories",
    },
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
                    className="bg-white border rounded-xl p-4 flex flex-col justify-start"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <Links
                        href={stat.link}
                        className="font-medium text-xs border-1 rounded-2xl p-1 items-center ml-2 gap-1 flex justify-center"
                      >
                        <Link className="inline" size={14} />
                        Detail
                      </Links>
                    </div>
                    <p className="text-4xl font-bold text-black mt-2">
                      {stat.value ?? "-"}
                    </p>
                    <p className="text-sm font-medium text-black mt-4">
                      {stat.text}
                    </p>
                  </div>
                ))}
              </div>

              <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                  <div className="grid flex-1 gap-1">
                    <CardTitle>Item Yang Di Pinjam</CardTitle>
                    <CardDescription>
                      Menunjukkan jumlah item yang dipinjam
                    </CardDescription>
                  </div>
                  <Select
                    value={timeRange}
                    onValueChange={(value: "7d" | "30d" | "90d") =>
                      setTimeRange(value)
                    }
                  >
                    <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex">
                      <SelectValue placeholder="Pilih rentang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="90d" className="rounded-lg">
                        3 Bulan Terakhir
                      </SelectItem>
                      <SelectItem value="30d" className="rounded-lg">
                        30 Hari Terakhir
                      </SelectItem>
                      <SelectItem value="7d" className="rounded-lg">
                        7 Hari Terakhir
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                  <DueDateChart data={filteredChartData} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
