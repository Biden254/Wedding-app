import React, { useEffect, useRef, useState } from "react";

export default function GiftFormModal({ gift, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    rsvp_status: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const nameRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    nameRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((s) => ({ ...s, [name]: "" }));
    setSubmitError(null);
  }

  function validate() {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError(err?.response?.data?.detail || err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function onBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onBackdropClick}
      aria-hidden={false}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reserve gift ${gift.title}`}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-lg mx-auto z-10 overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-weddingBrown">
              Reserve: {gift.title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close reservation dialog"
              className="text-gray-500 hover:text-gray-700 ml-3"
            >
              ✕
            </button>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <input
                ref={nameRef}
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                required
              />
              {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
                required
              />
              {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
            </div>

            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border-gray-200 shadow-sm p-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="rsvp_status"
                name="rsvp_status"
                type="checkbox"
                checked={!!form.rsvp_status}
                onChange={handleChange}
                className="rounded"
              />
              <label htmlFor="rsvp_status" className="text-sm text-gray-700">
                I will attend
              </label>
            </div>

            {submitError && <div className="text-sm text-red-600">{submitError}</div>}

            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-weddingBlue text-white disabled:opacity-60"
              >
                {submitting ? "Reserving…" : "Confirm Reserve"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
