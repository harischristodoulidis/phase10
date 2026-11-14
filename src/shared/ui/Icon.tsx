type IconProps = {
  src: string;
  size?: number;
};

// Paints the SVG file with the text color through a CSS mask, so icons follow currentColor.
export function Icon({ src, size = 20 }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 bg-current mask-contain mask-center mask-no-repeat"
      style={{
        width: size,
        height: size,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
      }}
    />
  );
}
