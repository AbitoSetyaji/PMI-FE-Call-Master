"use client";
import React, { useState, useEffect, useRef } from "react";

interface IndonesianTimePickerProps {
    value: string; // Format: HH:MM
    onChange: (value: string) => void;
    error?: string | null;
    className?: string;
    placeholder?: string;
}

export default function IndonesianTimePicker({
    value,
    onChange,
    error,
    className = "",
    placeholder = "HH:MM"
}: IndonesianTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Sync value with input
    useEffect(() => {
        if (value) {
            const [hour, minute] = value.split(":").map(Number);
            if (!isNaN(hour) && !isNaN(minute)) {
                setSelectedHour(hour);
                setSelectedMinute(minute);
                setInputValue(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
            }
        } else {
            setInputValue("");
            setSelectedHour(null);
            setSelectedMinute(null);
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

    // Parse HH:MM input
    const parseTimeInput = (input: string): { hour: number; minute: number } | null => {
        const match = input.match(/^(\d{1,2}):(\d{2})$/);
        if (match) {
            const hour = parseInt(match[1], 10);
            const minute = parseInt(match[2], 10);
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                return { hour, minute };
            }
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Only allow numbers and colon
        newValue = newValue.replace(/[^\d:]/g, "");

        // Auto-add colon
        if (newValue.length === 2 && !newValue.includes(":") && inputValue.length < newValue.length) {
            newValue = newValue + ":";
        }

        setInputValue(newValue);
    };

    const handleInputBlur = () => {
        if (inputValue) {
            const parsed = parseTimeInput(inputValue);
            if (parsed) {
                const time = `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`;
                onChange(time);
                setSelectedHour(parsed.hour);
                setSelectedMinute(parsed.minute);
            } else if (value) {
                // Reset to previous value
                const [h, m] = value.split(":").map(Number);
                setInputValue(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
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

    const handleHourClick = (hour: number) => {
        setSelectedHour(hour);
        if (selectedMinute !== null) {
            const time = `${String(hour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
            onChange(time);
        }
    };

    const handleMinuteClick = (minute: number) => {
        setSelectedMinute(minute);
        if (selectedHour !== null) {
            const time = `${String(selectedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            onChange(time);
            setIsOpen(false);
        }
    };

    const clearTime = () => {
        onChange("");
        setInputValue("");
        setSelectedHour(null);
        setSelectedMinute(null);
        setIsOpen(false);
    };

    const setNow = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        onChange(time);
        setIsOpen(false);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

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
                    maxLength={5}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg ${error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
                        } focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white`}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 mb-2 text-center">Jam</div>
                            <div className="h-48 overflow-y-auto">
                                {hours.map((hour) => (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={() => handleHourClick(hour)}
                                        className={`w-full py-1.5 text-sm text-center rounded transition-colors ${selectedHour === hour ? "bg-red-600 text-white" : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {String(hour).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500 mb-2 text-center">Menit</div>
                            <div className="h-48 overflow-y-auto">
                                {minutes.map((minute) => (
                                    <button
                                        key={minute}
                                        type="button"
                                        onClick={() => handleMinuteClick(minute)}
                                        className={`w-full py-1.5 text-sm text-center rounded transition-colors ${selectedMinute === minute ? "bg-red-600 text-white" : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {String(minute).padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-4 pt-3 border-t">
                        <button type="button" onClick={clearTime} className="text-sm text-gray-500 hover:text-gray-700">Hapus</button>
                        <button type="button" onClick={setNow} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sekarang</button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    );
}
