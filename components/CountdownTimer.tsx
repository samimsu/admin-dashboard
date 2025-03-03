// components/CountdownTimer.tsx
"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: string; // Can be empty string if no sale end
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!endTime) {
        setTimeLeft("No Sale");
        return;
      }

      const now = new Date();
      const end = new Date(endTime);
      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Sale Ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    if (endTime) {
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [endTime]);

  return (
    <span
      className={`font-semibold ${
        timeLeft === "Sale Ended"
          ? "text-gray-500"
          : timeLeft === "No Sale"
          ? "text-muted-foreground"
          : "text-red-500"
      }`}
    >
      {timeLeft}
    </span>
  );
}
