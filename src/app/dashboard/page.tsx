'use client';

import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuthorizer();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-black">
      <h1 className="text-3xl font-semibold mb-6">My Bookings</h1>

      {user && (
        <div className="mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-600">No bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white text-black"
            >
              <h2 className="text-lg font-medium">
                {booking.service?.name || 'Unknown Service'}
              </h2>
              <p>
                <strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link
          href="/book"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
        >
          Book New Appointment
        </Link>
      </div>
    </div>
  );
}
