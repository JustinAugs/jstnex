"use client";

import { useRef, type ReactNode } from "react";

type Option<T extends string> = { value: T; label: ReactNode };

export default function SegmentedControl<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const group = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);

  function select(next: T, button: HTMLButtonElement, pointer: boolean) {
    const previous = group.current?.querySelector('[aria-pressed="true"]');
    const marker = indicator.current;
    const start = animation.current && marker ? marker.getBoundingClientRect() : previous?.getBoundingClientRect();
    animation.current?.cancel();
    animation.current = null;
    onChange(next);
    if (!pointer || next === value || !start || !marker || !group.current ||
        matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const end = button.getBoundingClientRect();
    // On narrow screens, controls may wrap. Selection stays immediate across rows.
    if (Math.abs(start.top - end.top) > 2 || end.width === 0) return;
    const frame = group.current.getBoundingClientRect();
    Object.assign(marker.style, {
      left: `${end.left - frame.left}px`,
      top: `${end.top - frame.top}px`,
      width: `${end.width}px`,
      height: `${end.height}px`,
    });
    const motion = marker.animate(
      [
        { transform: `translateX(${start.left - end.left}px) scaleX(${start.width / end.width})`, opacity: 0.65 },
        { transform: "none", opacity: 0 },
      ],
      { duration: 160, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    animation.current = motion;
    motion.onfinish = () => { if (animation.current === motion) animation.current = null; };
  }

  return (
    <div className="segmented-control" role="group" aria-label={label} ref={group}>
      <span className="segmented-indicator" aria-hidden="true" ref={indicator} />
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={event => select(option.value, event.currentTarget, event.detail > 0)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
