import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { estimateReadingTime, formatBlogDate } from "@/lib/blog-helpers";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { getSiteSeoSettings } from "@/lib/site-seo";
import { landingImages } from "@/components/landing/data";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();

  return {
    title: `Blog | ${seo.siteName}`,
    description: "Kumpulan berita dan insight terbaru seputar crypto, market update, dan strategi trading.",
    openGraph: {
      description: "Kumpulan berita dan insight terbaru seputar crypto, market update, dan strategi trading.",
      title: `Blog | ${seo.siteName}`,
      type: "website",
      url: `${seo.siteUrl.replace(/\/$/, "")}/blog`,
    },
  };
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const [featuredPost, ...restPosts] = posts;

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-stone-950">
      <section className="relative overflow-hidden bg-[#0b1322] px-6 py-20 text-white sm:px-8 lg:px-10">
        <Image
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          fill
          sizes="100vw"
          src={landingImages.heroImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.76)_0%,rgba(4,8,16,0.9)_100%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition hover:text-white"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#10a7ff]">AIOTrade Newsroom</p>
          <h1 className="mt-5 max-w-4xl text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-[5.4rem]">
            Insight market, Update crypto, and Crypto News
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
        {featuredPost ? (
          <Link
            className="grid overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 lg:grid-cols-[1.1fr_0.9fr]"
            href={`/blog/${featuredPost.slug}`}
          >
            <div className="relative min-h-[320px] bg-[#0f1728]">
              <Image
                alt={featuredPost.title}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src={featuredPost.thumbnailUrl ?? landingImages.chartImage}
                unoptimized={Boolean(featuredPost.thumbnailUrl)}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.12)_0%,rgba(4,8,16,0.48)_100%)]" />
            </div>
            <div className="flex flex-col justify-center px-7 py-8 sm:px-10 sm:py-10">
              <span className="inline-flex w-fit rounded-full bg-[#f6be4f]/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#b77900]">
                {featuredPost.category}
              </span>
              <p className="mt-5 text-sm text-stone-500">
                {formatBlogDate(featuredPost.publishedAt)} • {estimateReadingTime(featuredPost.content)} menit baca
              </p>
              <h2 className="mt-3 text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.045em] text-stone-950 sm:text-[3rem]">
                {featuredPost.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">{featuredPost.excerpt}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1b74df]">
                Baca artikel
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-8 py-16 text-center text-stone-500">
            Belum ada postingan yang dipublish.
          </div>
        )}

        {restPosts.length ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {restPosts.map((post) => (
              <Link
                className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1"
                href={`/blog/${post.slug}`}
                key={post.id}
              >
                <div className="relative aspect-[16/10] bg-[#0f1728]">
                  <Image
                    alt={post.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    src={post.thumbnailUrl ?? landingImages.chartImage}
                    unoptimized={Boolean(post.thumbnailUrl)}
                  />
                </div>
                <div className="space-y-3 px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1b74df]">{post.category}</p>
                  <h3 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.035em] text-stone-950">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-7 text-stone-600">{post.excerpt}</p>
                  <p className="text-xs text-stone-500">
                    {formatBlogDate(post.publishedAt)} • {estimateReadingTime(post.content)} menit baca
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
