import { useState } from "react";
import { Car } from "@/types/workTypes";
import LoadingButton from "./common/LoadingButton";

interface Props {
  car: Car;
  onConfirm: (booking: { start: string; end: string }) => void;
}

export default function BookingForm({ car, onConfirm }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSubmit = () => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      alert("End date must be after start date.");
      return;
    }

    // Check for continuity
    const daysBetween =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;

    for (let i = 0; i < daysBetween; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const str = date.toISOString().split("T")[0];
      if (!car.availability[str]) {
        alert("Selected range contains unavailable dates.");
        return;
      }
    }

    onConfirm({ start, end });
  };

  return (
    <div className="mt-4 p-4 border rounded shadow bg-white">
      <h4 className="font-bold mb-2">Select Booking Dates</h4>
      <div className="flex gap-4">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <LoadingButton
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
      >
        Confirm Booking
      </LoadingButton>
    </div>
  );
}
