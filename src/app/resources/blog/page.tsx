import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand, PageHero } from "@/components/marketing/sections";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/feedback";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import { JsonLd } from "@/components/ui/prose";
import { Reveal } from "@/components/ui/reveal";
import { formatDateShort } from "@/lib/format";
import {
  getBlogCategoryBySlug,
  getBlogPosts,
  getTeamMemberById,
  getUsedBlogCategories,
} from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const found = category ? await getBlogCategoryBySlug(category) : undefined;

  if (found) {
    return buildMetadata({
      title: `${found.name} articles`,
      description: found.description,
      // Filtered views point their canonical at the unfiltered index so the
      // same articles are not indexed under several near-duplicate URLs.
      canonicalPath: "/resources/blog",
      noIndex: true,
    });
  }

  return buildMetadata({
    title: "Blog",
    description:
      "Articles on UK tax, accounting and running a business — for sole traders, contractors and limited companies.",
    canonicalPath: "/resources/blog",
  });
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [posts, categories] = await Promise.all([
    getBlogPosts({ categorySlug: category }),
    getUsedBlogCategories(),
  ]);

  const activeCategory = category
    ? await getBlogCategoryBySlug(category)
    : undefined;

  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Blog", path: "/resources/blog" },
        ])}
      />

      <PageHero
        eyebrow="Blog"
        title={activeCategory ? `${activeCategory.name} articles` : "Blog"}
        lead={
          activeCategory
            ? activeCategory.description
            : "Straight answers to the questions UK business owners actually ask. Written by the people who do the work."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: "Blog" },
        ]}
      />

      <Section tone="surface">
        <Container>
          <nav aria-label="Filter by category" className="mb-10">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/resources/blog"
                  aria-current={!category ? "page" : undefined}
                  className={cn(
                    "inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
                    !category
                      ? "bg-brand-700 text-white ring-brand-700"
                      : "bg-white text-ink-soft ring-line hover:ring-brand-300",
                  )}
                >
                  All
                </Link>
              </li>
              {categories.map((item) => {
                const isActive = category === item.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/resources/blog?category=${item.slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors",
                        isActive
                          ? "bg-brand-700 text-white ring-brand-700"
                          : "bg-white text-ink-soft ring-line hover:ring-brand-300",
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {posts.length === 0 ? (
            <EmptyState
              icon="search"
              title="No articles in this category yet"
              description="We're adding to the blog regularly. Try another category, or browse everything."
            />
          ) : (
            <>
              {featured ? <FeaturedPost post={featured} /> : null}

              {rest.length > 0 ? (
                <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, index) => (
                    <Reveal as="li" key={post.id} delay={index * 50}>
                      <Link
                        href={`/resources/blog/${post.slug}`}
                        className="group flex h-full flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
                      >
                        <p className="text-xs text-muted">
                          {formatDateShort(post.publishedAt)} ·{" "}
                          {post.readingMinutes} min read
                        </p>
                        <h2 className="mt-2.5 text-lg font-semibold text-ink transition-colors group-hover:text-brand-800">
                          {post.title}
                        </h2>
                        <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                        <span className="mt-5">
                          <Badge tone="neutral">
                            {categories.find(
                              (c) => c.slug === post.categorySlug,
                            )?.name ?? post.categorySlug}
                          </Badge>
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </Container>
      </Section>

      <CtaBand
        title="Still not sure how it applies to you?"
        body="Every business is a bit different. Book a free consultation and get an answer for your actual situation."
        primaryLabel="Speak to an Accountant"
      />
    </>
  );
}

async function FeaturedPost({
  post,
}: {
  post: Awaited<ReturnType<typeof getBlogPosts>>[number];
}) {
  const author = await getTeamMemberById(post.authorId);
  const category = await getBlogCategoryBySlug(post.categorySlug);

  return (
    <Link href={`/resources/blog/${post.slug}`} className="group block">
      <Card
        interactive
        className="grid gap-0 overflow-hidden hover:ring-brand-200 lg:grid-cols-[1.3fr_1fr]"
      >
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge>Featured</Badge>
            {category ? <Badge tone="neutral">{category.name}</Badge> : null}
          </div>

          <h2 className="mt-5 text-display-sm transition-colors group-hover:text-brand-800">
            {post.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <div className="mt-7 flex items-center gap-3">
            {author ? (
              <>
                <Avatar name={author.name} photoUrl={author.photoUrl} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink">{author.name}</p>
                  <p className="text-xs text-muted">
                    {formatDateShort(post.publishedAt)} ·{" "}
                    {post.readingMinutes} min read
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted">
                {formatDateShort(post.publishedAt)} · {post.readingMinutes} min
                read
              </p>
            )}
          </div>
        </div>

        {/* Editorial block rather than a stock photo. */}
        <div
          aria-hidden="true"
          className="hidden items-center justify-center bg-gradient-to-br from-brand-800 to-brand-900 p-9 lg:flex"
        >
          <p className="font-display text-[5rem] leading-none font-bold text-white/10">
            {String(post.readingMinutes).padStart(2, "0")}
          </p>
        </div>
      </Card>
    </Link>
  );
}
