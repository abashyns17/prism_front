'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

const API_BASE = 'https://prism-production-8537.up.railway.app';

export default function BookPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Fetch services on load
  useEffect(() => {
    fetch(`${API_BASE}/services`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setFeedback('❌ Failed to load services.'));
  }, []);

  // Refetch slots when service or date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability();
    }
  }, [selectedService, selectedDate]);

  const fetchAvailability = async () => {
    const dateStr = selectedDate?.toISOString().split('T')[0];
    try {
      const res = await fetch(`${API_BASE}/availability?serviceId=${selectedService}&date=${dateStr}`);
      const json = await res.json();
      const slots = Array.isArray(json.availability) ? json.availability : [];
      setAvailableSlots(slots);
    } catch (err) {
      setFeedback('❌ Failed to fetch availability.');
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setFeedback('❗ Please fill out all fields.');
      return;
    }

    const token = localStorage.getItem('authorizer-token');
    if (!token) {
      setFeedback('❗ You must be logged in to book.');
      return;
    }

    const parsedSlot = new Date(selectedSlot);
    if (isNaN(parsedSlot.getTime())) {
      setFeedback('❗ Invalid time selected.');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService,
          startTime: parsedSlot.toISOString(),
        }),
      });

      const resJson = await res.json();

      if (!res.ok) {
        setFeedback(`❌ Booking failed: ${resJson?.error || 'Unknown error'}`);
      } else {
        setFeedback('✅ Booking confirmed!');
        setSelectedSlot('');
        fetchAvailability();
      }
    } catch (err) {
      console.error(err);
      setFeedback('❌ Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Book a Service</h1>

      {/* Service Picker */}
      <div className="mb-4">
        <label className="block mb-2">Service:</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full p-2 rounded border bg-white text-black"
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (${s.price}, {s.duration} min)
            </option>
          ))}
        </select>
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <label className="block mb-2">Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
          placeholderText="Select a date"
          className="w-full p-2 rounded border bg-white text-black"
        />
      </div>

      {/* Slot Picker */}
      <div className="mb-4">
        <label className="block mb-2">Available Time Slots:</label>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          className="w-full p-2 rounded border bg-white text-black"
        >
          <option value="">Select a time</option>
          {availableSlots.map((iso) => (
            <option key={iso} value={iso}>
              {new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback */}
      {feedback && <p className="text-yellow-400 text-sm mb-4">{feedback}</p>}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Booking...' : 'Book'}
      </button>
    </div>
  );
}
