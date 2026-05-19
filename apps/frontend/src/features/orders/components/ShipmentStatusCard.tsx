type Props = {
  shipment: {
    carrier: string;
    trackingNumber: string;
    status: string;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  };
};

const steps = [
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
];

export default function ShipmentStatusCard({
  shipment,
}: Props) {
  const currentIndex = steps.indexOf(shipment.status);

  return (
    <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Shipment
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {shipment.carrier}
          </h2>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
          {shipment.status.replaceAll("_", " ")}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const active = index <= currentIndex;

          return (
            <div
              key={step}
              className="flex items-center gap-4"
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  active
                    ? "bg-white"
                    : "bg-white/20"
                }`}
              />

              <p
                className={
                  active
                    ? "text-white"
                    : "text-neutral-500"
                }
              >
                {step.replaceAll("_", " ")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-2 text-sm">
        <p className="text-neutral-400">
          Tracking:
          <span className="ml-2 font-mono text-white">
            {shipment.trackingNumber}
          </span>
        </p>

        {shipment.shippedAt && (
          <p className="text-neutral-500">
            Shipped:
            <span className="ml-2 text-white">
              {new Date(
                shipment.shippedAt,
              ).toLocaleString()}
            </span>
          </p>
        )}

        {shipment.deliveredAt && (
          <p className="text-neutral-500">
            Delivered:
            <span className="ml-2 text-white">
              {new Date(
                shipment.deliveredAt,
              ).toLocaleString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}