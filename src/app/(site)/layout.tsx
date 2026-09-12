import { SiteChrome } from "@/components/layout/site-chrome";

/** Wraps every public marketing route. The admin area sits outside it. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
