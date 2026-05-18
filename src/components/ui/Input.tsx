"use client";

import { cn } from "@/utils/cn";
import { type InputHTMLAttributes, forwardRef, useState, useEffect, useRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, type, value, onChange, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isNumber = type === "number";

    // For number inputs: maintain a local string state so users can type
    // intermediate values like "0.", "0.2", etc. without the parent
    // overwriting via controlled value.
    const [localValue, setLocalValue] = useState<string>(() => {
      if (!isNumber) return "";
      if (value === null || value === undefined || value === "" || value === 0) return "";
      return String(value);
    });
    const isFocused = useRef(false);

    // Sync local state from parent prop when NOT focused (external state changes)
    // OR when focused but the parent clamped/corrected the value
    useEffect(() => {
      if (!isNumber) return;
      if (!isFocused.current) {
        // Not focused: show empty for 0/null/undefined
        if (value === null || value === undefined || value === "" || Number(value) === 0) {
          setLocalValue("");
        } else {
          setLocalValue(String(value));
        }
      } else {
        // Focused: only override if parent clamped the value (e.g. negative → 0)
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed) && Number(value) !== parsed) {
          // Parent corrected the value (clamping) — update local to match
          if (Number(value) === 0) {
            setLocalValue("");
          } else {
            setLocalValue(String(value));
          }
        }
      }
    }, [value, isNumber]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;
      setLocalValue(raw);
      // Forward the event to parent onChange so it can parse the value
      onChange?.(e);
      // After parent processes, check if it would clamp to a different value
      // If the raw parses to something the parent would reject (e.g. negative when min=0),
      // schedule a correction after React processes the state update
      const parsed = parseFloat(raw);
      const min = props.min !== undefined ? Number(props.min) : undefined;
      const max = props.max !== undefined ? Number(props.max) : undefined;
      if (!isNaN(parsed)) {
        if (min !== undefined && parsed < min) {
          // Will be clamped by parent — clear after a tick
          setTimeout(() => setLocalValue(min === 0 ? "" : String(min)), 0);
        } else if (max !== undefined && parsed > max) {
          setTimeout(() => setLocalValue(String(max)), 0);
        }
      }
    }

    function handleFocus() {
      isFocused.current = true;
    }

    function handleBlur() {
      isFocused.current = false;
      // On blur, sync display with the canonical numeric value from parent
      // Show empty for 0/null/undefined (matches placeholder UX)
      if (value === null || value === undefined || value === "" || Number(value) === 0) {
        setLocalValue("");
      } else {
        setLocalValue(String(value));
      }
    }

    const inputProps = isNumber
      ? {
          value: localValue,
          onChange: handleNumberChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
        }
      : { value, onChange };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wide text-[#6b7280]"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-9 w-full items-center rounded-md border border-[#e5e5e5] bg-white text-sm focus-within:border-[#e05a2b] focus-within:ring-2 focus-within:ring-[#e05a2b]/20",
            error && "border-red-400 focus-within:border-red-400 focus-within:ring-red-200"
          )}
        >
          {prefix && (
            <span className="flex-shrink-0 select-none pl-3 pr-1 text-[#6b7280]">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none disabled:cursor-not-allowed disabled:text-[#6b7280]",
              prefix ? "pl-0 pr-3" : "px-3",
              suffix && "pr-0",
              className
            )}
            {...inputProps}
            {...props}
          />
          {suffix && (
            <span className="flex-shrink-0 select-none pl-1 pr-3 text-[#6b7280]">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
