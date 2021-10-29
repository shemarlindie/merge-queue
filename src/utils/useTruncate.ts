import { useMemo } from "react";

export function useTruncate(text: string, maxLength: number) {
  return useMemo(
    () => text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '...' : text,
    [maxLength, text]
  )
}