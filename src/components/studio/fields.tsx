"use client";

import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import type { ReactNode } from "react";

export function Card({ title, hint, children, actions }: { title?: string; hint?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#f3d6e2] bg-white/80 p-5 shadow-[0_8px_30px_-18px_rgba(190,60,120,0.35)] backdrop-blur sm:p-6">
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-[#4a1d36]">{title}</h3>}
            {hint && <p className="mt-0.5 text-sm text-[#9a6a82]">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

const inputCls =
  "w-full rounded-2xl border border-[#f0d3df] bg-white px-4 py-2.5 text-[15px] text-[#4a1d36] shadow-inner shadow-pink-50 outline-none transition placeholder:text-[#c9a3b5] focus:border-[#f0619a] focus:ring-4 focus:ring-[#f0619a]/15";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#6b3a55]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#a77b90]">{hint}</span>}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = "text",
  maxLength = 200,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} className={inputCls} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  maxLength = 4000,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <span className="relative block">
        <select className={`${inputCls} appearance-none pr-10`} value={value} onChange={(e) => onChange(e.target.value as T)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c06a9c]" />
      </span>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-[#fff6f9] px-4 py-3">
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-[#5b2140]">{label}</span>
        {hint && <span className="text-xs text-[#a77b90]">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[#f0619a]" : "bg-[#e9d5de]"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <Field label={`${label} · ${format(value)}`}>
      <input
        type="range"
        className="lu-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }}
      />
    </Field>
  );
}

export function Btn({
  children,
  onClick,
  variant = "soft",
  className = "",
  disabled,
  type = "button",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const v = {
    primary: "bg-gradient-to-r from-[#f0619a] to-[#c47bff] text-white shadow-[0_10px_24px_-10px_rgba(240,97,154,0.8)] hover:brightness-105",
    soft: "bg-[#fff0f5] text-[#a0336a] hover:bg-[#ffe3ee]",
    danger: "bg-[#fff1f1] text-[#c43c3c] hover:bg-[#ffe1e1]",
    ghost: "text-[#9a5a78] hover:bg-[#fff0f5]",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({ label, onClick, children, danger, disabled }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-30 ${danger ? "text-[#c43c3c] hover:bg-[#ffe1e1]" : "text-[#9a5a78] hover:bg-[#fff0f5]"}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------- reorderable list editor */

function Row<T extends { id: string }>({
  item,
  index,
  count,
  render,
  onMove,
  onDelete,
}: {
  item: T;
  index: number;
  count: number;
  render: (item: T, index: number) => ReactNode;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className="relative rounded-2xl border border-[#f3dbe5] bg-white p-3 pl-2 shadow-sm">
      <div className="flex gap-2">
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => controls.start(e)}
            className="flex h-9 w-7 cursor-grab touch-none items-center justify-center text-[#d2a3b8] active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <IconBtn label="Move up" onClick={() => onMove(index, index - 1)} disabled={index === 0}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Move down" onClick={() => onMove(index, index + 1)} disabled={index === count - 1}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
        <div className="min-w-0 flex-1">{render(item, index)}</div>
        <IconBtn label="Delete" onClick={onDelete} danger>
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      </div>
    </Reorder.Item>
  );
}

export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  render,
  onAdd,
  addLabel,
  onDelete,
  empty,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, index: number) => ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  onDelete?: (item: T) => void;
  empty?: string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && empty && <p className="rounded-2xl bg-[#fff6f9] px-4 py-6 text-center text-sm text-[#a77b90]">{empty}</p>}
      <Reorder.Group axis="y" values={items} onReorder={onChange} className="flex flex-col gap-3">
        {items.map((it, i) => (
          <Row
            key={it.id}
            item={it}
            index={i}
            count={items.length}
            render={render}
            onMove={move}
            onDelete={() => (onDelete ? onDelete(it) : onChange(items.filter((x) => x.id !== it.id)))}
          />
        ))}
      </Reorder.Group>
      {onAdd && (
        <Btn onClick={onAdd} className="self-start">
          <Plus className="h-4 w-4" /> {addLabel ?? "Add"}
        </Btn>
      )}
    </div>
  );
}

export const compactInput = inputCls;
