import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "اختر تاريخ",
  className,
  label
}: DatePickerProps) {
  // Event handler for input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setDate(new Date(e.target.value));
    } else {
      setDate(undefined);
    }
  };

  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDate = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Input
        type="date"
        value={formatDate(date)}
        onChange={handleChange}
        placeholder={placeholder}
        dir="ltr" // Keep date input left-to-right
        className={cn("h-10 text-right", className)}
      />
    </div>
  );
}