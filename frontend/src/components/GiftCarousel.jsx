import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import GiftFormModal from "./GiftFormModal";

export default function GiftCarousel() {
  const [gifts, setGifts] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);

  const touchStartX = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchGifts();

    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function fetchGifts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/gifts/");
      setGifts(res.data || []);
      setIndex(0);
    } catch (err) {
      console.error(err);
      setError("Could not load gifts. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  function prev() {
    setIndex((i) => (gifts.length ? (i - 1 + gifts.length) % gifts.length : 0));
  }

  function next() {
    setIndex((i) => (gifts.length ? (i + 1) % gifts.length : 0));
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 60) prev();
    else if (dx < -60) next();
    touchStartX.current = null;
  }

  function openReserve(gift) {
    if (gift.reserved) return;
    setSelectedGift(gift);
    setShowModal(true);
  }

  async function handleGuestSubmit(guestData) {
    if (!selectedGift) return;
    try {
      const guestResp = await api.post("/guests/rsvp/", guestData);
      const guestId =
        guestResp.data.id ??
        guestResp.data.pk ??
        guestResp.data.uuid ??
        guestResp.data;

      await api.patch(`/gifts/${selectedGift.id}/reserve/`, { guest_id: guestId });
      await fetchGifts();
      setShowModal(false);
      setSelectedGift(null);
      alert("Gift reserved — thank you!");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Could not reserve gift. See console.");
    }
  }

  if (loading) return <div className="p-6">Loading gifts…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!gifts.length) return <div className="p-6">No gifts available</div>;

  const gift = gifts[index];

  return (
    <div
      className="w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
      aria-roledescription="carousel"
      aria-label="Gift registry carousel"
    >
      <div className="flex items-center justify-center gap-4">
        <button
          aria-label="previous gift"
          onClick={prev}
          className="text-3xl text-gray-400 hover:text-weddingBlue disabled:opacity-50"
        >
          ‹
        </button>

        <article
          className="gift-card bg-weddingLightBeige rounded-xl p-4 shadow-md w-80"
          role="group"
          aria-roledescription="slide"
          aria-label={`${gift.title} ${gift.reserved ? "reserved" : "available"}`}
        >
          <div className="relative">
            <img
              src={gift.image || "/placeholder.png"}
              alt={gift.title}
              className="w-full h-48 rounded-md object-cover"
            />
            {gift.reserved && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                <span className="text-white font-semibold bg-black/40 px-3 py-1 rounded">
                  Reserved
                </span>
              </div>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-weddingBrown">{gift.title}</h3>
          {gift.description && (
            <p className="text-sm text-gray-600 mt-1">{gift.description}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            {gift.price ? `KES ${gift.price}` : "Price N/A"}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              disabled={gift.reserved}
              onClick={() => openReserve(gift)}
              className={`w-full py-2 rounded-md ${
                gift.reserved ? "bg-gray-300" : "bg-weddingBlue text-white"
              }`}
            >
              {gift.reserved ? "Reserved" : "Reserve this gift"}
            </button>

            {gift.link && (
              <a
                href={gift.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 text-center rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                Buy on Carrefour
              </a>
            )}
          </div>
        </article>

        <button
          aria-label="next gift"
          onClick={next}
          className="text-3xl text-gray-400 hover:text-weddingBlue disabled:opacity-50"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {gifts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to gift ${i + 1}`}
            className={`w-2 h-2 rounded-full ${
              i === index ? "bg-weddingBlue" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {showModal && selectedGift && (
        <GiftFormModal
          gift={selectedGift}
          onClose={() => setShowModal(false)}
          onSubmit={handleGuestSubmit}
        />
      )}
    </div>
  );
}
