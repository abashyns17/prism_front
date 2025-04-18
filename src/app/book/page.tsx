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
  const [selectedDate, setSelectedDate] = useState('');
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

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedService || !selectedDate) return;
      try {
        const res = await fetch(`${API_BASE}/availability?serviceId=${selectedService}&date=${selectedDate}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setAvailableSlots(data);
          if (data.length === 0) {
            setFeedback('⚠️ No available slots for this service on the selected date.');
          }
        } else {
          console.warn('Invalid slot data:', data);
          setAvailableSlots([]);
          setFeedback('⚠️ Failed to load availability.');
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setFeedback('❗ Error loading slots.');
      }
    };
    fetchSlots();
  }, [selectedService, selectedDate]);

  const handleBooking = async () => {
    const token = localStorage.getItem('authorizer-token');
    if (!token) {
      setFeedback('❗ You must be logged in to book.');
      return;
    }

    try {
      const parsedSlot = new Date(selectedSlot);
      const dateStr = parsedSlot.toISOString().split('T')[0];
      const timeStr = parsedSlot.toTimeString().slice(0, 5);

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

      <label className="block mb-1">Select Date:</label>
      <input
        type="date"
        className="border p-2 mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

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
