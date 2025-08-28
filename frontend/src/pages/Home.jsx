import React, { useEffect, useMemo, useState } from "react";
import GiftCarousel from "../components/GiftCarousel";

export default function Home() {
  // Event date (adjust as needed)
  const eventDate = useMemo(() => new Date("2025-08-27T16:00:00"), []);
  const [timeLeft, setTimeLeft] = useState(getRemaining(eventDate));

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getRemaining(eventDate)), 1000);
    return () => clearInterval(t);
  }, [eventDate]);

  const venueAddress = encodeURIComponent("Karangata SDA, Langata Road, Nairobi, Kenya");
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueAddress}`;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="hero rounded-xl p-6 bg-weddingLightBeige">
        <img
          src="./src/pages/banner.jpg"
          alt="Wedding banner"
          className="hero-image rounded-md w-full h-56 object-cover"
        />
        <h1 className="hero-title mt-4 text-3xl font-bold text-weddingBrown">
          Join us as we say "I do"
        </h1>
        <p className="text-gray-700 mt-2">
          We're excited to celebrate with family and friends — come share the day.
        </p>

        {/* Countdown */}
        <div className="count-cards flex gap-4 mt-4 flex-wrap">
          <CountCard label="Days" value={timeLeft.days} />
          <CountCard label="Hours" value={timeLeft.hours} />
          <CountCard label="Minutes" value={timeLeft.minutes} />
          <CountCard label="Seconds" value={timeLeft.seconds} />
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="section rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-weddingBrown">RSVP</h2>
        <p className="text-sm text-gray-600 mt-2">
          Please let us know your plans by June 1st, 2025.
        </p>
        <div className="mt-4">
          <a className="btn primary px-4 py-2 rounded-md" href="#registry">
            RSVP &amp; View Registry
          </a>
        </div>
      </section>

      {/* Ceremony / Details */}
      <section id="details" className="section rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-weddingBrown">Ceremony</h2>
        <p className="text-sm text-gray-600 mt-2">
          Saturday, August 27th, 2025 — 4:00 PM
        </p>
        <p className="text-sm text-gray-600">
          The Grand Ballroom, 123 Oak Street, Anytown, USA
        </p>
        <div className="mt-4 flex gap-3">
          <a
            className="btn map-btn px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            View Map
          </a>
          <a
            className="btn px-4 py-2 rounded-md bg-weddingBlue text-white"
            href="#registry"
          >
            Registry
          </a>
        </div>
      </section>

      {/* Registry */}
      <section id="registry" className="registry rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-weddingBrown">Registry</h2>
        <p className="text-sm text-gray-600 mt-2">
          Browse gifts below. Swipe left/right or use arrows to navigate. Reserve
          a gift to start the reservation flow.
        </p>
        <div className="mt-4">
          <GiftCarousel />
        </div>
      </section>

      {/* Photos placeholder */}
      <section id="photos" className="section rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-weddingBrown">Photos</h2>
        <p className="text-sm text-gray-600 mt-2">Gallery coming soon.</p>
      </section>
    </div>
  );
}

/* Small helper components / functions */

function CountCard({ label, value }) {
  return (
    <div className="count-card bg-[{#eef6ff}] rounded-md px-4 py-3 text-center min-w-[80px]">
      <div className="text-2xl font-semibold text-weddingBrown">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function getRemaining(target) {
  const now = new Date().getTime();
  const diff = Math.max(0, target.getTime() - now);

  const secondsTotal = Math.floor(diff / 1000);
  const days = Math.floor(secondsTotal / (60 * 60 * 24));
  const hours = Math.floor((secondsTotal % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);
  const seconds = secondsTotal % 60;

  return { days, hours, minutes, seconds };
}
