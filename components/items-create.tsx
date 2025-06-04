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
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const itemsSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  stock: z.number().min(1, "Stock must be at least 1"),
  image: z.any(),
  category_slugs: z.string().min(1, "Category is required"),
});

export default function ItemsCreate({
  refreshData,
}: {
  refreshData: () => void;
}) {
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<
    Array<{ slug: string; name: string }>
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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

    if (isDialogOpen) {
      fetchCategories();
    }
  }, [isDialogOpen]);

  const createItem = async () => {
    const token = getCookie("token");
    const url = process.env.NEXT_PUBLIC_API_URL;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("stock", stock.toString());
    if (image) {
      formData.append("image", image);
    }
    formData.append("category_slugs", selectedCategory);

    try {
      await axios.post(`${url}/api/admin/items`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return true;
    } catch (error) {
      console.error("Error creating item:", error);
      throw error;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const validation = itemsSchema.safeParse({
      name,
      stock: Number(stock),
      image,
      category_slugs: selectedCategory,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await createItem();
      setIsDialogOpen(false);
      resetForm();
      refreshData();
    } catch (error) {
      setErrors({ submit: "Failed to create item. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setStock(0);
    setImage(null);
    setSelectedCategory("");
    setErrors({});
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Add Items +</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
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

            {/* Stock */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <div className="col-span-3">
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="Enter stock quantity"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Image File */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Category */}
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
                {errors.category_slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.category_slug}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-red-500 text-sm text-center col-span-full">
                {errors.submit}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
