export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[-350px] left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[180px]" />

      <div className="absolute top-[1200px] right-[-250px] h-[700px] w-[700px] rounded-full bg-white/[0.02] blur-[180px]" />

      <div className="absolute bottom-[-350px] left-[-250px] h-[700px] w-[700px] rounded-full bg-white/[0.02] blur-[180px]" />
    </div>
  );
}
