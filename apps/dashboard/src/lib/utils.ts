import { clsx as cn, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function clsx(...inputs: ClassValue[]) {
  return twMerge(cn(inputs))
}
