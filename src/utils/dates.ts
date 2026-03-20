export const fetchBookedDates = async (carId: string) => {
    const res = await fetch(`/api/cars/${carId}/booked-dates`);
    const data = await res.json();
    return data.bookedRanges; // [{ start: "...", end: "..." }]
  };