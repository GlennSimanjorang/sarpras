"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { Category } from "./page";

export const columns = (refreshData: () => void): ColumnDef<Category>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
      const [open, setOpen] = useState(false);
      const [name, setName] = useState(category.name);
      const [slug, setSlug] = useState(category.slug);

      const handleSave = async () => {
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.put(
            `${url}/api/admin/categories/${slug}`,
            { name, slug },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setOpen(false);
          refreshData(); 
        } catch (error) {
          alert("Failed to update category.");
          console.error(error);
        }
      };

      const destroyCategory = async () => {
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.delete(`${url}/api/admin/categories/${category.slug}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          refreshData(); 
        } catch (error) {
          alert("Failed to delete category.");
          console.error(error);
        }
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={destroyCategory}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit Category</SheetTitle>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSave}>Save Category</Button>
                  <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      );
    },
  },
];
