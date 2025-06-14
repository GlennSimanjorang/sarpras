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
import { useState, useEffect, useRef } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { Items } from "./page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const editItemsSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  stock: z.number().min(0, "Stock cannot be negative"),
  category_slugs: z.string().min(1, "Category is required"),
});

export const columns = (refreshData: () => void): ColumnDef<Items>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ row }) => {
      const [isUploading, setIsUploading] = useState(false);
      const fileInputRef = useRef<HTMLInputElement>(null);
      const refresh = refreshData; // Capture refreshData from closure

      const handleImageClick = () => {
        fileInputRef.current?.click();
      };

      const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;
        const sku = row.original.sku; // Use SKU from item data

        try {
          await axios.post(
            `${url}/api/admin/items/${sku}/change-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          refresh(); // Refresh table data
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image. Please try again.");
        } finally {
          setIsUploading(false);
          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

      const imageUrl = row.getValue("image_url") as string;

      return (
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />
          <img
            src={imageUrl}
            alt="Item image"
            className={`h-16 w-16 object-cover rounded-md ${
              isUploading ? "opacity-50" : "cursor-pointer"
            }`}
            onClick={handleImageClick}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
              <span className="text-white text-xs">Uploading...</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Categories",
    header: "Categories",
    cell: ({ row }) => {
      const categories = row.original.categories;
      return <div>{categories.map((cat) => cat.name).join(", ")}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const items = row.original;
      const [open, setOpen] = useState(false);
      const [name, setName] = useState(items.name);
      const [stock, setStock] = useState(items.stock.toString());
      const [selectedCategory, setSelectedCategory] = useState(
        items.categories[0]?.slug || ""
      );
      const [categories, setCategories] = useState<
        Array<{ slug: string; name: string }>
      >([]);
      const [isSaving, setIsSaving] = useState(false);
      const [errors, setErrors] = useState<Record<string, string>>({});

      useEffect(() => {
        if (open) {
          const fetchCategories = async () => {
            const token = getCookie("token");
            const url = process.env.NEXT_PUBLIC_API_URL;
            try {
              const response = await axios.get(`${url}/api/admin/categories`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setCategories(response.data.data);
            } catch (error) {
              console.error("Error fetching categories:", error);
            }
          };
          fetchCategories();
        }
      }, [open]);

      const handleSave = async () => {
        setIsSaving(true);
        setErrors({});

        // Validasi form
        const validation = editItemsSchema.safeParse({
          name,
          stock: Number(stock),
          category_slugs: selectedCategory,
        });

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
          // PERBAIKAN: Mengirim data sebagai JSON
          await axios.put(
            `${url}/api/admin/items/${items.sku}`,
            {
              name,
              stock: Number(stock),
              category_slugs: selectedCategory,
            },
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
          let errorMessage = "Failed to update item. Please try again.";
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

      const destroyItem = async () => {
        const token = getCookie("token");
        const url = process.env.NEXT_PUBLIC_API_URL;

        try {
          await axios.delete(`${url}/api/admin/items/${items.sku}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          refreshData();
        } catch (error: any) {
          alert(error.response?.data?.message || "Failed to delete item.");
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
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={destroyItem}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="w-full max-w-md">
              <SheetHeader>
                <SheetTitle>Edit Item</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter item name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Enter stock quantity"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_slugs && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category_slugs}
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
                    {isSaving ? "Saving..." : "Save Item"}
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

