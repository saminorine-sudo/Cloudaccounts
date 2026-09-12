import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaBand } from "@/components/marketing/sections";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLink, ButtonLink } from "@/components/ui/button";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import {
  Breadcrumbs,
  JsonLd,
  Prose,
  tableOfContents,
} from "@/components/ui/prose";
import { formatDate } from "@/lib/format";
import {
  getBlogCategoryBySlug,
  getBlogPostBySlug,
  getBlogPosts,
  getTeamMemberById,
} from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return buildMetadata(post.seo);
}

/**
 * Content comes from the database, so the page is regenerated periodically
 * rather than frozen at build time. A CMS edit appears within the hour
 * without a redeploy; until Supabase is connected this is a no-op.
 */
export const revalidate = 3600;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [author, category, related] = await Promise.all([
    getTeamMemberById(post.authorId),
    getBlogCategoryBySlug(post.categorySlug),
    getBlogPosts({ limit: 3, excludeSlug: post.slug }),
  ]);

  const contents = tableOfContents(post.body);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/resources/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          authorName: author?.name ?? "CloudAccounts",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Blog", path: "/resources/blog" },
          { name: post.title, path: `/resources/blog/${post.slug}` },
        ])}
      />

      <article>
        <header className="border-b border-line bg-white">
          <Container className="py-12 sm:py-16">
            <Breadcrumbs
              className="mb-6"
              items={[
                { label: "Home", href: "/" },
                { label: "Resources", href: "/resources" },
                { label: "Blog", href: "/resources/blog" },
                { label: post.title },
              ]}
            />

            <div className="max-w-3xl">
              {category ? (
                <Link href={`/resources/blog?category=${category.slug}`}>
                  <Badge>{category.name}</Badge>
                </Link>
              ) : null}

              <h1 className="mt-5 text-display-lg">{post.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                {post.excerpt}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {author ? (
                  <>
                    <Avatar
                      name={author.name}
                      photoUrl={author.photoUrl}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {author.name}
                      </p>
                      <p className="text-xs text-muted">{author.role}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mx-1 h-8 w-px bg-line"
                    />
                  </>
                ) : null}
                <p className="text-xs text-muted">
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                  {post.updatedAt ? (
                    <> · Updated {formatDate(post.updatedAt)}</>
                  ) : null}
                  {" · "}
                  {post.readingMinutes} min read
                </p>
              </div>
            </div>
          </Container>
        </header>

        <Section tone="surface">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_16rem] lg:gap-16">
              <div className="min-w-0 max-w-3xl">
                <Prose blocks={post.body} />

                {post.tags.length > 0 ? (
                  <ul className="mt-12 flex flex-wrap gap-2 border-t border-line pt-8">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Badge tone="neutral">{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                {contents.length > 0 ? (
                  <nav aria-labelledby="toc-heading" className="hidden lg:block">
                    <h2
                      id="toc-heading"
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                    >
                      On this page
                    </h2>
                    <ul className="mt-4 flex flex-col gap-2.5 border-l border-line">
                      {contents.map((entry) => (
                        <li key={entry.id}>
                          <a
                            href={`#${entry.id}`}
                            className="-ml-px block border-l-2 border-transparent pl-3.5 text-sm leading-snug text-muted transition-colors hover:border-brand-500 hover:text-brand-700"
                          >
                            {entry.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}

                <Card className="mt-8 p-5">
                  <h2 className="text-sm font-semibold text-ink">
                    Need this answered for your business?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    General guidance only takes you so far. Book a free
                    consultation and get an answer for your actual numbers.
                  </p>
                  <ButtonLink
                    href="/book-consultation"
                    size="sm"
                    className="mt-4 w-full"
                    data-analytics={`blog-${post.slug}-cta`}
                  >
                    Speak to an Accountant
                  </ButtonLink>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        {related.length > 0 ? (
          <Section tone="white">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-display-sm">Read next</h2>
                <ArrowLink href="/resources/blog">All articles</ArrowLink>
              </div>

              <ul className="mt-10 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/resources/blog/${item.slug}`}
                      className="group flex h-full flex-col rounded-card bg-white p-6 shadow-card ring-1 ring-line transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
                    >
                      <p className="text-xs text-muted">
                        {item.readingMinutes} min read
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-ink transition-colors group-hover:text-brand-800">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                        {item.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>
        ) : null}
      </article>

      <CtaBand />
    </>
  );
}
