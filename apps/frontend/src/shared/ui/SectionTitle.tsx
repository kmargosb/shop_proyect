type Props = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionTitle({ eyebrow, title, description }: Props) {
  return (
    <>
      <p className="text-xs tracking-[0.35em] text-neutral-500 uppercase">{eyebrow}</p>

      <h2 className="mt-6 max-w-4xl text-4xl leading-tight font-bold md:text-5xl">{title}</h2>

      {description && (
        <p className="mt-8 max-w-3xl text-lg leading-9 text-neutral-400">{description}</p>
      )}
    </>
  );
}
