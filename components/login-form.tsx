"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { z } from "zod";
import { useState } from "react";


const loginSchema = z.object({
  username: z.string().min(3, "username minimal 3 karakter"),
  password: z.string().min(3, "Password minimal 3 karakter"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const url = process.env.NEXT_PUBLIC_API_URL;
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      loginSchema.parse(formData);
      
      const response = await axios.post(`${url}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });      
      window.location.href = "dashboard"
    } catch (error) {
      setIsLoading(false);
      setError("Username atau password salah");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back To Sarpras</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="grid gap-3">
                <Label htmlFor="text">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="udin kasep"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
