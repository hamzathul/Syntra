"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useCreateCategoryMutation,
} from "@/hooks/items/use-items-query";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { toast } from "sonner";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = "Select a category...",
}: CategoryComboboxProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateCategoryMutation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = categories?.find((c) => c.id === value);

  const filtered = useMemo(() => {
    if (!categories) return [];
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = useCallback(async () => {
    const name = query.trim();
    if (!name) return;
    try {
      const created = await createMutation.mutateAsync({ name });
      onChange(created.id);
      setQuery("");
      setOpen(false);
      toast.success("Category created");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }, [query, createMutation, onChange]);

  const exactMatch = filtered.some(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase(),
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span
          className={cn(
            "truncate",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? selected.name : placeholder}
        </span>
        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or type a new category..."
            className="h-8 mb-1"
          />
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onChange(category.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                  category.id === value && "bg-accent",
                )}
              >
                <span>{category.name}</span>
                {category.id === value && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No matching categories
              </div>
            )}
          </div>
          {query.trim() && !exactMatch && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="mt-1 w-full justify-start gap-2"
            >
              {createMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              Create &ldquo;{query.trim()}&rdquo;
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
