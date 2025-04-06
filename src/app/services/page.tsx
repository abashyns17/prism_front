'use client';

import { useEffect, useState } from 'react';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  createdAt: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  const seedServices = async () => {
    const sample = [
      { name: 'Haircut', price: 30, duration: 45 },
      { name: 'Manicure', price: 25, duration: 30 },
      { name: 'Massage', price: 60, duration: 60 },
    ];

    for (const service of sample) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
    }

    fetchServices(); // refresh after seeding
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Available Services</h1>
        <button
          onClick={seedServices}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Seed Sample Services
        </button>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.id} className="p-4 border rounded shadow-sm">
              <h2 className="text-xl font-medium">{service.name}</h2>
              <p>Price: ${service.price}</p>
              <p>Duration: {service.duration} minutes</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
