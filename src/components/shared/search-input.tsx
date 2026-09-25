"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  placeholder?: string;
  basePath: string;
};

export function SearchInput({ placeholder, basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const defaultValue = params.get("q") ?? "";

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pl-9"
        disabled={pending}
        onChange={(e) => {
          const q = e.target.value;
          startTransition(() => {
            const url = q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath;
            router.replace(url);
          });
        }}
      />
    </div>
  );
}
