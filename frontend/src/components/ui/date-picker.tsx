import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className,
  style,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Convert YYYY-MM-DD to MM/DD/YYYY for display
  React.useEffect(() => {
    if (value) {
      try {
        const date = parse(value, "yyyy-MM-dd", new Date());
        if (isValid(date)) {
          setInputValue(format(date, "MM/dd/yyyy"));
        } else {
          setInputValue(value);
        }
      } catch {
        setInputValue(value);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  // Parse MM/DD/YYYY or M/D/YYYY input to Date
  const parseInputDate = (input: string): Date | null => {
    if (!input || input.trim() === "") {
      return null;
    }
    
    // Remove any non-digit characters except slashes and dashes
    const cleaned = input.replace(/[^\d/\-]/g, "");
    
    // Try parsing as YYYY-MM-DD first (if it contains dashes)
    if (cleaned.includes("-")) {
      try {
        const date = parse(cleaned, "yyyy-MM-dd", new Date());
        if (isValid(date)) {
          return date;
        }
      } catch {
        // Ignore
      }
    }
    
    // Try to parse various MM/DD/YYYY formats
    const formats = ["MM/dd/yyyy", "M/d/yyyy", "MM/d/yyyy", "M/dd/yyyy", "MM/dd/yy", "M/d/yy"];
    
    for (const fmt of formats) {
      try {
        const date = parse(cleaned, fmt, new Date());
        if (isValid(date)) {
          // Check if the year is reasonable (not in the future by more than 100 years, not before 1900)
          const year = date.getFullYear();
          const currentYear = new Date().getFullYear();
          if (year >= 1900 && year <= currentYear + 100) {
            return date;
          }
        }
      } catch {
        continue;
      }
    }
    
    return null;
  };

  // Handle manual input change - only allow numbers and separators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers, slashes, and dashes
    const filteredValue = inputValue.replace(/[^\d/\-]/g, "");
    setInputValue(filteredValue);
    
    // Try to parse and update if valid
    const parsedDate = parseInputDate(filteredValue);
    if (parsedDate && isValid(parsedDate)) {
      onChange(format(parsedDate, "yyyy-MM-dd"));
    }
  };

  // Handle input blur - validate and format
  const handleInputBlur = () => {
    const parsedDate = parseInputDate(inputValue);
    if (parsedDate && isValid(parsedDate)) {
      const formatted = format(parsedDate, "MM/dd/yyyy");
      setInputValue(formatted);
      onChange(format(parsedDate, "yyyy-MM-dd"));
    } else if (inputValue.trim() === "") {
      onChange("");
      setInputValue("");
    }
  };

  // Handle calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
      setOpen(false);
    }
  };

  // Get selected date for calendar
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const date = parse(value, "yyyy-MM-dd", new Date());
      return isValid(date) ? date : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div style={{ position: "relative" }} className={className}>
        <Input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
            const allowedKeys = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End'
            ];
            
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
              return;
            }
            
            // Allow allowed keys
            if (allowedKeys.includes(e.key)) {
              return;
            }
            
            // Only allow numbers (0-9), forward slash (/), and dash (-)
            const isNumber = /^[0-9]$/.test(e.key);
            const isSlash = e.key === '/';
            const isDash = e.key === '-' || e.key === '–' || e.key === '—';
            
            if (!isNumber && !isSlash && !isDash) {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          style={{
            ...style,
            paddingRight: "40px",
          }}
          className="date-picker-input"
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            style={{
              position: "absolute",
              right: "0px",
              top: "50%",
              transform: "translateY(-50%)",
              height: "100%",
              width: "40px",
              padding: "0",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarIcon 
              className="h-4 w-4" 
              style={{ color: "white" }}
            />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        style={{
          background: "rgba(26, 31, 55, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "white",
          backdropFilter: "blur(10px)",
        }}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleCalendarSelect}
          initialFocus
          className="dark-calendar"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-white",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-transparent hover:border-white/20"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-white/70 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-white/10 [&:has([aria-selected])]:bg-white/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "h-9 w-9 p-0 font-normal text-white hover:bg-white/20 aria-selected:opacity-100"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-[#0075FF] text-white hover:bg-[#0075FF] hover:text-white focus:bg-[#0075FF] focus:text-white",
            day_today: "bg-white/10 text-white font-bold",
            day_outside:
              "text-white/30 opacity-50 aria-selected:bg-white/10 aria-selected:text-white/30 aria-selected:opacity-30",
            day_disabled: "text-white/20 opacity-50",
            day_range_middle: "aria-selected:bg-white/10 aria-selected:text-white",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: ({ ...props }) => (
              <ChevronLeft className="h-4 w-4" style={{ color: "white" }} {...props} />
            ),
            IconRight: ({ ...props }) => (
              <ChevronRight className="h-4 w-4" style={{ color: "white" }} {...props} />
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

