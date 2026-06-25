export default function FounderCollage() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-5">
      <div className="flex aspect-[4/5] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03]">
        Portrait
      </div>

      <div className="flex aspect-[4/5] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03]">
        Working
      </div>

      <div className="flex aspect-video items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03]">
        Street
      </div>

      <div className="flex aspect-video items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03]">
        Friends
      </div>
    </div>
  );
}
