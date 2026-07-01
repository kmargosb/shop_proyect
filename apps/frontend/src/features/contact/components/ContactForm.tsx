'use client';

import { useContactForm } from '../hooks/useContactForm';

export default function ContactForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    loading,
    onSubmit,
  } = useContactForm();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
      <div>
        <p className="text-xs tracking-[0.25em] text-neutral-500 uppercase">Send a message</p>

        <h2 className="mt-3 text-2xl font-bold text-white">We'd love to hear from you.</h2>

        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        {/* Honeypot */}

        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          {...register('website')}
        />

        {/* NAME */}

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Name</label>

          <input
            {...register('name')}
            placeholder="Your name"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white transition outline-none focus:border-white/30"
          />

          {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>}
        </div>

        {/* EMAIL */}

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Email</label>

          <input
            type="email"
            {...register('email')}
            placeholder="your@email.com"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white transition outline-none focus:border-white/30"
          />

          {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
        </div>

        {/* SUBJECT */}

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Subject</label>

          <input
            {...register('subject')}
            placeholder="How can we help?"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white transition outline-none focus:border-white/30"
          />

          {errors.subject && <p className="mt-2 text-sm text-red-400">{errors.subject.message}</p>}
        </div>

        {/* MESSAGE */}

        <div>
          <label className="mb-2 block text-sm text-neutral-400">Message</label>

          <textarea
            rows={7}
            {...register('message')}
            placeholder="Tell us more..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white transition outline-none focus:border-white/30"
          />

          {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-white text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.01] hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </section>
  );
}
