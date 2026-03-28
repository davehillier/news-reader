export function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-10 sm:my-14">
      <div className="flex-1 h-px bg-[var(--color-pearl)]" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[var(--color-bronze)]" />
      <div className="flex-1 h-px bg-[var(--color-pearl)]" />
    </div>
  );
}
