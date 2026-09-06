import type { Testimonial } from "@/types/content";

/**
 * DEMO TESTIMONIALS — NOT REAL CLIENT REVIEWS.
 *
 * These are written placeholders. They are not from real clients and must not
 * be published as genuine reviews. The testimonials section renders a visible
 * demo label while `siteSettings.showDemoNotices` is true.
 *
 * Before launch: replace with reviews the firm holds written permission to
 * publish, and record where each was collected (Google, Trustpilot, direct).
 */
export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    quote:
      "CloudAccounts made our accounts feel simple for the first time. I finally understand what is happening with the numbers in my business, and I get an answer the same day when I ask something.",
    name: "Sarah Mitchell",
    role: "Director",
    company: "London-based consultancy",
    rating: 5,
    photoUrl: null,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    id: "test-2",
    quote:
      "We moved over mid-year, which I was told would be a nightmare. It took one call and a form. The first VAT return went out on time and nothing has been late since.",
    name: "James Okonkwo",
    role: "Founder",
    company: "E-commerce business",
    rating: 5,
    photoUrl: null,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    id: "test-3",
    quote:
      "The monthly management accounts changed how we make decisions. We stopped guessing about whether we could afford to hire and started knowing.",
    name: "Priya Raman",
    role: "Managing Director",
    company: "Design studio",
    rating: 5,
    photoUrl: null,
    isFeatured: true,
    displayOrder: 3,
  },
  {
    id: "test-4",
    quote:
      "As a contractor I mostly wanted someone to tell me what to pay myself and when. That is exactly what I get, without a lecture attached.",
    name: "Daniel Hughes",
    role: "IT contractor",
    company: "Limited company",
    rating: 5,
    photoUrl: null,
    isFeatured: false,
    displayOrder: 4,
  },
  {
    id: "test-5",
    quote:
      "My previous accountant charged for every email. Knowing I can just ask a question has genuinely made me run the business better.",
    name: "Amelia Clarke",
    role: "Owner",
    company: "Independent retailer",
    rating: 5,
    photoUrl: null,
    isFeatured: false,
    displayOrder: 5,
  },
  {
    id: "test-6",
    quote:
      "Straightforward, quick to respond, and they explain things without making you feel like you should already have known.",
    name: "Tom Bradley",
    role: "Partner",
    company: "Construction firm",
    rating: 4,
    photoUrl: null,
    isFeatured: false,
    displayOrder: 6,
  },
].map((testimonial) => ({ ...testimonial, isDemo: true }) as Testimonial);
