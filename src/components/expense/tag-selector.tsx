"use client";

import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/use-tags";

interface TagSelectorProps {
  selectedIds: string[];
  onToggle: (tagId: string) => void;
}

export function TagSelector({ selectedIds, onToggle }: TagSelectorProps) {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-secondary">
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            color={tag.color}
            selected={selectedIds.includes(tag.id)}
            onClick={() => onToggle(tag.id)}
          >
            <span>{tag.icon}</span>
            <span>{tag.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
