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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(4, "Name is required"),
});

export type Category = {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
};

async function getCategories(): Promise<Category[]> {
  const token = getCookie("token");
  const res = await axios.get("http://127.0.0.1:8000/api/admin/categories", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.data;
}

const createCategory = async (name: string) => {
  const token = getCookie("token");
  const url = process.env.NEXT_PUBLIC_API_URL;

  try {
    await axios.post(
      `${url}/api/admin/categories`,
      { name },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export default function Categories() {
  const [data, setData] = React.useState<Category[]>([]);
  const [categoryName, setCategoryName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refreshData = () => {
    getCategories().then(setData).catch(console.error);
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const columns = rawColumns(refreshData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = categorySchema.safeParse({ name: categoryName });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      await createCategory(categoryName);
      setIsDialogOpen(false);
      setCategoryName("");
      setError(null);
      refreshData();
    } catch (error) {
      setError("Failed to add category, try again.");
      console.error(error);
    }
  };

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
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Category +</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>
                    Add a new category to organize your content
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter category name"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm col-span-4 text-center">
                      {error}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Konten utama - Data Table */}
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
