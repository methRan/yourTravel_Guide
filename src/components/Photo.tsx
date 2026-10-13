import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
/** Sample contact-sheet panels are framed with CSS without distorting their proportions. */
export default function Photo({
  src = "",
  alt = "",
  className = "",
  loading,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [file, fragment] = src.split("#crop=");
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!fragment || !ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [fragment]);
  if (!fragment)
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        {...props}
      />
    );
  const [columns, rows, column, row] = fragment.split(",").map(Number);
  const cell = Math.max(size.width, size.height);
  return (
    <span
      ref={ref}
      className={`photo ${className}`}
      role="img"
      aria-label={alt}
    >
      <img
        src={file}
        alt=""
        loading={loading}
        {...props}
        style={{
          position: "absolute",
          maxWidth: "none",
          width: cell * columns,
          height: cell * rows,
          left: -column * cell - (cell - size.width) / 2,
          top: -row * cell - (cell - size.height) / 2,
          objectFit: "fill",
          transform: "none",
          border: 0,
          borderRadius: 0,
        }}
      />
    </span>
  );
}
