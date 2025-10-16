"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col items-end gap-2 w-full md:w-auto">
      <div className="flex gap-2 w-full md:w-auto">
        <Input
          type="email"
          placeholder="Enter your email"
          className="w-full md:w-64 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          required
        />
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </Button>
      </div>
      {status === "success" && (
        <p className="text-green-500 text-xs">Thanks! Check your email.</p>
      )}
      {status === "error" && (
        <p className="text-red-500 text-xs">Something went wrong. Try again.</p>
      )}
      {status === "idle" && (
        <p className="text-gray-600 text-xs">Get notified when we add new metrics</p>
      )}
    </form>
  );
}
