"use client";

export default function SettingsTab() {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <p className="mt-2 text-sm text-neutral-500">
        User preferences and experience.
      </p>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <p className="font-medium">Marketing Emails</p>

            <p className="mt-1 text-sm text-neutral-500">
              Receive updates and new releases.
            </p>
          </div>

          <button className="rounded-full bg-white px-4 py-2 text-sm text-black">
            Enabled
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
          <div>
            <p className="font-medium">Premium Mode</p>

            <p className="mt-1 text-sm text-neutral-500">
              Enhanced experience for customers.
            </p>
          </div>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}