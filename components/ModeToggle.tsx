"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(() => (theme === "dark" ? "light" : "dark"));
  }

  return (
    <div className="flex items-center space-x-4">
      <Switch
        id="theme"
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="theme">
        <Moon />
      </Label>
    </div>
  );
}
