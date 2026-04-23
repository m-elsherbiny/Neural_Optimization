"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { ar, enUS } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useI18n } from "../../lib/i18n"

export function DatePickerWithRange({
  date,
  setDate,
  className
}: {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
}) {
  const { lang } = useI18n()
  const locale = lang === 'ar' ? ar : enUS

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker-range"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale })} -{" "}
                  {format(date.to, "LLL dd, y", { locale })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale })
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DatePickerSimple({
  date,
  setDate,
  className
}: {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}) {
  const { lang } = useI18n()
  const locale = lang === 'ar' ? ar : enUS

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale }) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
