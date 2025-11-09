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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CaptionProps } from "react-day-picker";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Custom Caption component with month/year dropdowns
interface CustomCaptionProps extends CaptionProps {
  onMonthSelect?: (date: Date) => void;
}

function CustomCaption({ displayMonth, onMonthChange, onMonthSelect }: CustomCaptionProps) {
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  // Generate array of months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate array of years (from 1900 to current year + 10)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: currentYearNum + 10 - 1900 + 1 }, (_, i) => 1900 + i).reverse();
  
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentYear, parseInt(monthIndex), 1);
    // Call the direct callback first to update state immediately
    if (onMonthSelect) {
      onMonthSelect(newDate);
    }
    // Also call react-day-picker's callback
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };
  
  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth, 1);
    // Call the direct callback first to update state immediately
    if (onMonthSelect) {
      onMonthSelect(newDate);
    }
    // Also call react-day-picker's callback
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };
  
  return (
    <div className="flex justify-center items-center gap-2 pt-1">
      <Select
        value={currentMonth.toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger 
          className="h-7 w-[120px] text-sm font-medium text-white bg-transparent border-white/20 hover:border-white/40"
          style={{
            background: "transparent",
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        >
          <SelectValue>{months[currentMonth]}</SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="bg-[#1A1F37] border-white/10"
          style={{
            background: "rgba(26, 31, 55, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
          }}
        >
          {months.map((month, index) => (
            <SelectItem 
              key={month} 
              value={index.toString()}
              className="text-white focus:bg-white/20 focus:text-white"
              style={{ color: "white" }}
            >
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={currentYear.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger 
          className="h-7 w-[80px] text-sm font-medium text-white bg-transparent border-white/20 hover:border-white/40"
          style={{
            background: "transparent",
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        >
          <SelectValue>{currentYear}</SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="bg-[#1A1F37] border-white/10"
          style={{
            background: "rgba(26, 31, 55, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            maxHeight: "200px",
          }}
        >
          {years.map((year) => (
            <SelectItem 
              key={year} 
              value={year.toString()}
              className="text-white focus:bg-white/20 focus:text-white"
              style={{ color: "white" }}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
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
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    // Initialize with selected date or current date
    if (value) {
      try {
        const date = parse(value, "yyyy-MM-dd", new Date());
        if (isValid(date)) {
          return date;
        }
      } catch {
        // Ignore
      }
    }
    return new Date();
  });

  // Convert YYYY-MM-DD to MM/DD/YYYY for display
  React.useEffect(() => {
    if (value) {
      try {
        const date = parse(value, "yyyy-MM-dd", new Date());
        if (isValid(date)) {
          setInputValue(format(date, "MM/dd/yyyy"));
          // Only update current month if popover is closed (external value change)
          // If popover is open, let user navigate freely
          if (!open) {
            setCurrentMonth(date);
          }
        } else {
          setInputValue(value);
        }
      } catch {
        setInputValue(value);
      }
    } else {
      setInputValue("");
    }
  }, [value, open]);

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
      // Update current month to the selected date's month
      setCurrentMonth(date);
      setOpen(false);
    }
  };

  // Handle month navigation (from prev/next buttons or dropdowns)
  const handleMonthChange = React.useCallback((newMonth: Date) => {
    setCurrentMonth(newMonth);
  }, []);

  // Direct handler for month/year dropdown selections
  const handleMonthSelect = React.useCallback((newMonth: Date) => {
    setCurrentMonth(newMonth);
  }, []);

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

  // Update current month when popover opens to ensure it shows the selected date's month
  React.useEffect(() => {
    if (open && selectedDate) {
      setCurrentMonth(selectedDate);
    } else if (open && !selectedDate) {
      // If no date is selected, show current month
      setCurrentMonth(new Date());
    }
  }, [open, selectedDate]);

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
          month={currentMonth}
          onMonthChange={handleMonthChange}
          initialFocus
          className="dark-calendar"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-1",
            caption_label: "hidden",
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
            Caption: (props) => (
              <CustomCaption {...props} onMonthSelect={handleMonthSelect} />
            ),
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

