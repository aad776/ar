import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveExperience, LockedExperience } from "@/components/experience/LiveExperience";
import { lockedTeaser, lookupExperience } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/birthday/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const res = await lookupExperience(slug);
  const name = res.status === "ok" ? res.config.recipientName : "you";
  const title = `A little surprise for ${name} 🎀`;
  const description = "Someone made a little universe, just for you. Open it with the sound on 💗";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url: `/birthday/${slug}` },
    twitter: { card: "summary_large_image", title, description },
    // personal pages should never be indexed
    robots: { index: false, follow: false },
  };
}

export default async function BirthdayPage({ params }: PageProps<"/birthday/[slug]">) {
  const { slug } = await params;
  const res = await lookupExperience(slug);

  if (res.status === "unconfigured") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-dreamy px-6 text-center">
        <p className="text-5xl">🎀</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Publishing isn&apos;t set up yet</h1>
        <p className="max-w-md text-ink-soft">
          This site doesn&apos;t have cloud storage configured, so shared links can&apos;t load. The creator needs to add
          Supabase credentials (see README). Meanwhile, you can peek at the demo.
        </p>
        <Link href="/birthday/demo" className="btn-cute">
          See the demo
        </Link>
      </main>
    );
  }
  if (res.status === "not-found") notFound();

  const teaser = lockedTeaser(res.config);
  if (teaser) return <LockedExperience teaser={teaser} />;
  return <LiveExperience config={res.config} />;
}
