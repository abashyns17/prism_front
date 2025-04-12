"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function BookPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE}/services`);
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setFeedback('❗ Failed to load services.');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authorizer-token');
    if (!token) {
      setFeedback('❗ You must be logged in to book.');
    }
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API_BASE}/availability?serviceId=${selectedService}`);
      const data = await res.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('authorizer-token');
    if (!token) {
      setFeedback('❗ You must be logged in to book.');
      return;
    }

    try {
      const parsedSlot = new Date(selectedSlot);
      const dateStr = parsedSlot.toISOString().split('T')[0];
      const timeStr = parsedSlot.toTimeString().slice(0, 5); // "HH:mm"

      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService,
          date: dateStr,
          time: timeStr,
        }),
      });

      if (res.ok) {
        setFeedback('✅ Booking successful!');
        router.push('/dashboard');
      } else {
        const errData = await res.json();
        setFeedback(`❌ Booking failed: ${errData.error}`);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setFeedback('❌ Something went wrong.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Book a Service</h1>

      <label className="block mb-1">Select Service:</label>
      <select
        className="border p-2 mb-4"
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value="">-- Choose --</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4"
        onClick={fetchSlots}
        disabled={!selectedService}
      >
        Load Available Slots
      </button>

      <label className="block mb-1">Select Slot:</label>
      <select
        className="border p-2 mb-4"
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
      >
        <option value="">-- Choose --</option>
        {availableSlots.map((iso) => (
          <option key={iso} value={iso}>
            {new Date(iso).toLocaleString()}
          </option>
        ))}
      </select>

      <button
        className="bg-green-600 text-white px-4 py-2"
        onClick={handleBooking}
        disabled={!selectedSlot || !selectedService}
      >
        Confirm Booking
      </button>

      {feedback && <p className="mt-4 text-red-600">{feedback}</p>}
    </div>
  );
}
