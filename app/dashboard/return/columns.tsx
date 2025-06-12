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
import { ReturnItem } from "./page";

export const columns = (refreshData: () => void): ColumnDef<ReturnItem>[] => [
  {
    accessorKey: "id",
    header: "Return ID",
  },
  {
    accessorKey: "borrowing.user.username",
    header: "User",
    cell: ({ row }) => row.original.borrowing.user.username,
  },
  {
    id: "borrowing.item.name",
    accessorFn: (row) => row.borrowing.item.name,
    header: "Item",
    cell: ({ row }) => row.original.borrowing.item.name,
  },

  {
    accessorKey: "returned_quantity",
    header: "Returned Qty",
  },
  {
    accessorKey: "borrowing.status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded ${
          row.original.borrowing.status === "returned"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.borrowing.status}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Return Date",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const returnItem = row.original;
      const [loading, setLoading] = useState(false);

      // Cek apakah return sudah diproses
      const isProcessed = returnItem.handled_by !== null;

      const handleAction = async (actionType: "approve" | "reject") => {
        setLoading(true);
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.patch(
            `${url}/api/admin/returns/${returnItem.id}/${actionType}`,
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
          alert(`Failed to ${actionType} return`);
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={loading || isProcessed}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleAction("approve")}
              disabled={loading || isProcessed}
            >
              Approve Return
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction("reject")}
              disabled={loading || isProcessed}
              className="text-red-500"
            >
              Reject Return
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
