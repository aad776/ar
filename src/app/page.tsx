import Link from "next/link";
import { AmbientCanvas } from "@/components/experience/AmbientCanvas";

const features = [
  { emoji: "🎀", title: "A story, not a card", text: "Nine little scenes unfold one tap at a time — from a mysterious opening to a final gift box." },
  { emoji: "🕯️", title: "Blow out the candles", text: "Tap them, or blow into the mic. Confetti, sparkles and a hidden wish follow." },
  { emoji: "📸", title: "Your memories, beautifully", text: "Polaroid walls, scrapbooks, film rolls, floating cards or a magazine cover story." },
  { emoji: "💌", title: "Open-when letters", text: "Envelopes that open into handwritten letters for every mood." },
  { emoji: "🌌", title: "A little universe", text: "A night sky where every glowing star carries a wish for her." },
  { emoji: "🎨", title: "Six dreamy themes", text: "Coquette pink to starry night — colours, fonts, frames and motion all change." },
];

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-dreamy text-ink">
      <AmbientCanvas preset="hearts" colors={["#ff8fb8", "#ffc2d6", "#f0619a", "#d9b8ff"]} density={0.7} className="-z-10" />
      <div aria-hidden className="absolute -left-40 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#ffc2d6]/50 blur-3xl" />
      <div aria-hidden className="absolute -right-40 top-60 -z-10 h-[460px] w-[460px] rounded-full bg-[#d9c4ff]/50 blur-3xl" />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-28">
        <span className="rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-[0.25em] text-ink-soft uppercase">a birthday surprise studio</span>
        <h1 className="mt-6 font-display text-5xl leading-[1.02] font-semibold tracking-tight sm:text-7xl">
          A little universe
          <br />
          <span className="font-script text-[1.15em] font-normal text-accent">made for you</span> 💗
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Build a magical, interactive birthday experience for someone special — photos, letters, music, candles and a sky full of wishes — then send it as a single link.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/studio" className="btn-cute px-8 text-base">
            Open the studio ✨
          </Link>
          <Link href="/birthday/demo" className="btn-ghost px-8 text-base">
            See the demo 🎂
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink-soft">She just opens the link — no app, no account, no login.</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={f.title} className="rounded-[var(--radius-card)] glass p-6" style={{ rotate: `${(i % 3) - 1}deg` }}>
            <p className="text-3xl">{f.emoji}</p>
            <h2 className="mt-3 font-display text-xl font-semibold">{f.title}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="pb-10 text-center font-hand text-xl text-ink-soft">made with a little extra effort 🎀</footer>
    </main>
  );
}
