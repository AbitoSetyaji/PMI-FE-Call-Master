"use client";
import React, { useState, useEffect, useRef } from "react";

interface IndonesianDatePickerProps {
    value: string; // ISO format: YYYY-MM-DD
    onChange: (value: string) => void;
    error?: string | null;
    className?: string;
    placeholder?: string;
}

const MONTHS_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function IndonesianDatePicker({
    value,
    onChange,
    error,
    className = "",
    placeholder = "DD/MM/YYYY"
}: IndonesianDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [inputValue, setInputValue] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    // Parse value to Date and sync input
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                setInputValue(`${day}/${month}/${year}`);
                setCurrentMonth(date);
            }
        } else {
            setInputValue("");
        }
    }, [value]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Parse DD/MM/YYYY to ISO date
    const parseInputToISO = (input: string): string | null => {
        const match = input.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
        if (match) {
            const [, day, month, year] = match;
            const d = parseInt(day, 10);
            const m = parseInt(month, 10);
            const y = parseInt(year, 10);

            if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
                const date = new Date(y, m - 1, d);
                if (date.getDate() === d && date.getMonth() === m - 1) {
                    return date.toISOString().split("T")[0];
                }
            }
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Only allow numbers and slashes
        newValue = newValue.replace(/[^\d\/]/g, "");

        // Auto-add slashes
        if (newValue.length === 2 && !newValue.includes("/") && inputValue.length < newValue.length) {
            newValue = newValue + "/";
        } else if (newValue.length === 5 && newValue.split("/").length === 2 && inputValue.length < newValue.length) {
            newValue = newValue + "/";
        }

        setInputValue(newValue);
    };

    const handleInputBlur = () => {
        if (inputValue) {
            const isoDate = parseInputToISO(inputValue);
            if (isoDate) {
                onChange(isoDate);
            } else if (value) {
                const date = new Date(value);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                setInputValue(`${day}/${month}/${year}`);
            }
        } else {
            onChange("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleInputBlur();
            setIsOpen(false);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const days: (number | null)[] = [];

        for (let i = 0; i < startingDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    };

    const handleDateClick = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const date = new Date(year, month, day);
        const isoDate = date.toISOString().split("T")[0];
        onChange(isoDate);
        setIsOpen(false);
    };

    const goToPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        onChange(today.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    const clearDate = () => {
        onChange("");
        setInputValue("");
        setIsOpen(false);
    };

    const selectedDate = value ? new Date(value) : null;
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    };
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear();
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    maxLength={10}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                        } focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white`}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72">
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="font-semibold text-gray-700">{MONTHS_ID[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                        <button type="button" onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS_ID.map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {generateCalendar().map((day, index) => (
                            <div key={index} className="aspect-square">
                                {day && (
                                    <button
                                        type="button"
                                        onClick={() => handleDateClick(day)}
                                        className={`w-full h-full flex items-center justify-center text-sm rounded-full transition-colors ${isSelected(day) ? "bg-red-600 text-white" : isToday(day) ? "bg-blue-100 text-blue-600 font-semibold" : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-4 pt-3 border-t">
                        <button type="button" onClick={clearDate} className="text-sm text-gray-500 hover:text-gray-700">Hapus</button>
                        <button type="button" onClick={goToToday} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Hari Ini</button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}
