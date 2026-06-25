import Parallax from '../../../../shared/ui/Parallax';

export default function FounderHeroPhotos() {
  return (
    <Parallax offset={50}>
      <div className="relative flex h-full items-center justify-center">
        {/* Main portrait */}

        <div className="flex aspect-[4/5] w-[78%] items-center justify-center rounded-[34px] border border-dashed border-white/10 bg-white/[0.03]">
          <span className="text-sm tracking-[0.3em] text-neutral-600 uppercase">Portrait</span>
        </div>

        {/* Skate */}

        <div className="absolute right-0 bottom-8 flex aspect-[3/4] w-[42%] items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.03]">
          <span className="text-sm tracking-[0.3em] text-neutral-600 uppercase">Skate</span>
        </div>
      </div>
    </Parallax>
  );
}
