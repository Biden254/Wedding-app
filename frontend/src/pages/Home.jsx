import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GiftCarousel from "../components/GiftCarousel";
import banner from "../pages/banner.jpg";  

// Environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const eventDate = useMemo(() => new Date("2025-10-26T10:00:00"), []);
  const [timeLeft, setTimeLeft] = useState(getRemaining(eventDate));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [file, setFile] = useState(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getRemaining(eventDate)), 1000);
    return () => clearInterval(t);
  }, [eventDate]);

  const venueAddress = encodeURIComponent(
    "Karangata SDA, Langata Road, Nairobi, Kenya"
  );
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueAddress}`;

  const handleRSVP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/guests/rsvp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: ` Hapo sawa ${name}! Umebook seat yako. Usichelewe siku ya harusi, hatukuholdii seat bana 😎`,
        });
        setName("");
        setEmail("");
        setPhone("");
      } else {
        setMessage({
          type: "error",
          text: `😏 Aiii ${name || "bro"}! Server imekata story: ${
            data.detail || "Jaribu tena tafadhali"
          }`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `🙄 Wueh! Hii net inacheza na feelings zetu bana. Refresh ndio tufanye mambo freshi.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();

    if (!file || !uploadedBy) {
      setPhotoMessage("Weka jina na picha kwanza, ndugu 😅");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("uploaded_by", uploadedBy);

    try {
      setUploading(true);
      setPhotoMessage("");
      await fetch(`${API_URL}/api/weddings/gallery/upload/`, {
        method: "POST",
        body: formData,
      });
      setPhotoMessage("Picha imeingia safi sana! Asante 🥳");
      setFile(null);
      setUploadedBy("");
    } catch (error) {
      console.error("Upload failed:", error);
      setPhotoMessage("Eish! Kuna shida kidogo 😬 Jaribu tena.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="hero rounded-2xl p-6 bg-weddingLightBeige shadow-md">
        <img
          src={banner}  
          alt="Wedding banner"
          className="hero-image rounded-lg w-full h-56 object-cover shadow"
        />
        <h1 className="hero-title mt-4 text-3xl font-bold text-weddingBrown">
          Join us as we say "I do"
        </h1>
        <p className="text-gray-700 mt-2">
          We're excited to celebrate with family and friends — come share the
          day.
        </p>

        {/* Countdown */}
        <div className="count-cards flex gap-4 mt-6 flex-wrap justify-center">
          <CountCard label="Days" value={timeLeft.days} />
          <CountCard label="Hours" value={timeLeft.hours} />
          <CountCard label="Minutes" value={timeLeft.minutes} />
          <CountCard label="Seconds" value={timeLeft.seconds} />
        </div>
      </section>

      {/* RSVP */}
      <section
        id="rsvp"
        className="section rounded-2xl p-8 bg-white shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-weddingBrown text-center">
          RSVP
        </h2>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Please let us know your plans by October 15th, 2025.
          <br />
          Kindly RSVP early so we can plan your seat and your plate. Soja akiamka vibaya 😆… mbona sikuoni kwa list boss 🤷‍♂
        </p>

        <form
          onSubmit={handleRSVP}
          className="mt-8 max-w-lg mx-auto space-y-6 bg-gray-50 p-8 rounded-xl shadow-inner"
        >
          {/* Inputs */}
          <InputField
            id="name"
            label="Your Name"
            value={name}
            setValue={setName}
          />
          <InputField
            id="email"
            label="Your Email"
            type="email"
            value={email}
            setValue={setEmail}
          />
          <InputField
            id="phone"
            label="Your Contact"
            type="tel"
            value={phone}
            setValue={setPhone}
          />

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-5 py-3 rounded-xl font-semibold text-white shadow transition-all ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-weddingBlue hover:bg-weddingDarkBlue"
            }`}
          >
            {isSubmitting ? "Medi kiasi..." : "Submit"}
          </motion.button>
        </form>

        {/* Feedback */}
        {message && (
          <div
            className={`mt-6 max-w-lg mx-auto p-4 rounded-lg text-sm font-medium shadow-md transition ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </section>

      {/* Ceremony */}
      <section
        id="details"
        className="section rounded-2xl p-6 bg-white shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-weddingBrown">Ceremony</h2>
        <p className="text-sm text-gray-600 mt-2">
          Sunday, October 26th, 2025 — 10:00 AM
        </p>
        <p className="text-sm text-gray-600">
          Karengata SDA, Langata Road, Nairobi, Kenya
        </p>
        <div className="mt-4 flex gap-3 flex-wrap">
          <a
            className="btn map-btn px-5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 shadow"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            View Map
          </a>
        </div>
      </section>

      {/* Gifts */}
      <section
        id="gifts"
        className="section rounded-2xl p-6 bg-white shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-weddingBrown">Gifts</h2>
        <p className="text-sm text-gray-600 mt-2">
          Sasa ona umetafuta gift siku tatu😬. If the options feel endless😩, remember—Carrefour vouchers always do the magic.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <a
            href="https://www.carrefour.ke/"
            target="_blank"
            rel="noreferrer"
            className="btn px-5 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 shadow"
          >
            💳 Carrefour Gift Vouchers
          </a>
        </div>
        <div className="mt-4">
          <GiftCarousel />
        </div>
      </section>

      {/* Support Section */}
      <section
        id="support"
        className="section rounded-2xl p-6 bg-white shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-weddingBrown">Support</h2>
        <p className="text-sm text-gray-600 mt-2">
          Want to support us as we put this big day together? M-Pesa contributions are welcome on +254 791 952226 (Dennis Muchemi) or feel free to reach out for more info.
        </p>
      </section>

      {/* Photos */}
      <section
        id="photos"
        className="section rounded-2xl p-6 bg-white shadow-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-weddingBrown">Photos</h2>
        <p className="text-sm text-gray-600 mt-2">
          Share your angles with us 📸… iPhone 18 and Samsung S27 upwards only—this is a Luo wedding 
        </p>
        <form
          onSubmit={handlePhotoSubmit}
          className="mt-6 max-w-lg mx-auto space-y-4 bg-gray-50 p-6 rounded-xl shadow-inner"
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
            className="w-full rounded-xl border border-gray-200 p-3 shadow-sm bg-white"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={uploading}
            className={`w-full px-5 py-2 rounded-xl font-semibold text-white shadow transition-all ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-weddingBlue hover:bg-weddingDarkBlue"
            }`}
          >
            {uploading ? "⏳ Inapandishwa..." : "Upload "}
          </motion.button>
        </form>

        {photoMessage && (
          <div
            className={`mt-4 max-w-lg mx-auto p-4 rounded-lg text-sm font-medium shadow-md transition ${
              photoMessage.includes("safi")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {photoMessage}
          </div>
        )}
      </section>
    </div>
  );
}

/* Reusable Input Field Component */
function InputField({ id, label, placeholder, type = "text", value, setValue }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 p-3 text-gray-700 placeholder-gray-400 shadow-sm focus:border-weddingBlue focus:ring-2 focus:ring-weddingBlue transition sm:text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
    </div>
  );
}

/* Countdown Card */
function CountCard({ label, value }) {
  return (
    <div className="count-card bg-[#eef6ff] rounded-xl px-5 py-4 text-center min-w-[90px] shadow-lg border border-gray-200">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold text-weddingBrown"
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

/* Countdown calculation */
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
