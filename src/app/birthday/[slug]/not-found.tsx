import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-dreamy px-6 text-center">
      <p className="text-6xl">🌙</p>
      <h1 className="font-display text-3xl font-semibold text-ink">This little universe is hiding</h1>
      <p className="max-w-sm text-ink-soft">
        The link might be mistyped, or the surprise hasn&apos;t been published yet. Double-check the link you were sent 💌
      </p>
      <Link href="/" className="btn-ghost">
        Go home
      </Link>
    </main>
  );
}
