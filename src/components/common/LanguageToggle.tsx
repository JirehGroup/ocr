// @/components/common/LanguageToggle.tsx

"use client";
import React from "react";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/context/LanguageContext";

const languages: { code: "en" | "am"; name: string; flag: string; enabled: boolean }[] = [
  { code: "am", name: "አማርኛ", flag: "🇪🇹", enabled: true },
  { code: "en", name: "English", flag: "🇺🇸", enabled: true },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, name, flag, enabled }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => enabled && setLanguage(code)}
            className={`cursor-pointer ${enabled ? "" : "opacity-50 cursor-not-allowed"}`}
            disabled={!enabled}
          >
            <span className="mr-2">{flag}</span>
            {name}
            {!enabled && <span className="ml-2 text-xs">(Coming soon)</span>}
            {language === code && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
