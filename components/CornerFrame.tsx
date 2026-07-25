/** Thin bracket ornaments at the 4 corners of a section — 12px arms at
 * ~15px insets per the maquette. */
export default function CornerFrame({ inset = "16px" }: { inset?: string }) {
  const corner = "absolute size-3 border-cream/25";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10"
      style={{ inset }}
    >
      <span className={`${corner} top-0 left-0 border-t border-l`} />
      <span className={`${corner} top-0 right-0 border-t border-r`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} right-0 bottom-0 border-r border-b`} />
    </div>
  );
}
