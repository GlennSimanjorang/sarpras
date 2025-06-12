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
import { User } from "./page";
import { z } from "zod";

const editUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const columns = (refreshData: () => void): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "last_login_at",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("last_login_at") as string | null;
      return lastLogin ? new Date(lastLogin).toLocaleString() : "Never";
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => new Date(row.getValue("updated_at")).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      const [open, setOpen] = useState(false);
      const [username, setUsername] = useState(user.username);
      const [isSaving, setIsSaving] = useState(false);
      const [errors, setErrors] = useState<Record<string, string>>({});

      const handleSave = async () => {
        setIsSaving(true);
        setErrors({});

        const validation = editUserSchema.safeParse({ username });

        if (!validation.success) {
          const newErrors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
          setIsSaving(false);
          return;
        }

        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.put(
            `${url}/api/admin/users/${user.id}`,
            { username },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setOpen(false);
          refreshData();
        } catch (error: any) {
          let errorMessage = "Failed to update user. Please try again.";
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            errorMessage = error.response.data.message;
          }
          setErrors({ submit: errorMessage });
          console.error(error);
        } finally {
          setIsSaving(false);
        }
      };

      const deleteUser = async () => {
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.delete(`${url}/api/admin/users/${user.id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          refreshData();
        } catch (error: any) {
          alert(error.response?.data?.message || "Failed to delete user.");
          console.error(error);
        }
      };

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
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={deleteUser}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full max-w-md">
              <SheetHeader>
                <SheetTitle>Edit User</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-sm text-center col-span-full">
                    {errors.submit}
                  </p>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="mt-4"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
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
