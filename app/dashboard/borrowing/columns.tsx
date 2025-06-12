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
import { useState } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { Borrowing } from "./page";

export const columns = (refreshData: () => void): ColumnDef<Borrowing>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "user.username",
    header: "User",
    cell: ({ row }) => row.original.user.username,
  },
  {
    accessorKey: "item.name",
    header: "Item",
    cell: ({ row }) => row.original.item.name,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const borrowing = row.original;
      const [loading, setLoading] = useState(false);

      const handleAction = async (actionType: "approve" | "reject") => {
        setLoading(true);
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.patch(
            `${url}/api/admin/borrows/${borrowing.id}/${actionType}`,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          refreshData();
        } catch (error) {
          alert(`Failed to ${actionType} borrowing`);
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Ganti aksi menjadi Approve dan Reject */}
            <DropdownMenuItem
              onClick={() => handleAction("approve")}
              disabled={loading || borrowing.status !== "pending"}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("reject")}
              disabled={loading || borrowing.status !== "pending"}
              className="text-red-500"
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
