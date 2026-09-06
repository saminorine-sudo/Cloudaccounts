import type { BlogCategory, BlogPost } from "@/types/content";

export const blogCategories: BlogCategory[] = [
  {
    id: "cat-tax",
    slug: "tax",
    name: "Tax",
    description: "Corporation Tax, Self Assessment and tax planning.",
  },
  {
    id: "cat-accounting",
    slug: "accounting",
    name: "Accounting",
    description: "Year-end accounts, reporting and financial statements.",
  },
  {
    id: "cat-business",
    slug: "business",
    name: "Business",
    description: "Running, structuring and growing a UK business.",
  },
  {
    id: "cat-vat",
    slug: "vat",
    name: "VAT",
    description: "Registration, schemes, returns and Making Tax Digital.",
  },
  {
    id: "cat-payroll",
    slug: "payroll",
    name: "Payroll",
    description: "Paying staff, RTI and auto-enrolment.",
  },
  {
    id: "cat-bookkeeping",
    slug: "bookkeeping",
    name: "Bookkeeping",
    description: "Keeping records that the rest of your numbers can rely on.",
  },
  {
    id: "cat-startup",
    slug: "startup",
    name: "Startup",
    description: "Getting a new business set up correctly.",
  },
  {
    id: "cat-small-business",
    slug: "small-business",
    name: "Small Business",
    description: "Practical finance for owner-managed businesses.",
  },
  {
    id: "cat-contractors",
    slug: "contractors",
    name: "Contractors",
    description: "Accounting for contractors and freelancers.",
  },
  {
    id: "cat-financial-planning",
    slug: "financial-planning",
    name: "Financial Planning",
    description: "Cash flow, forecasting and planning ahead.",
  },
];

/**
 * DEMO CONTENT — editorial articles.
 *
 * Written to be genuinely useful rather than to hit a keyword count.
 * Deliberately avoids quoting specific tax rates and thresholds in prose,
 * because those change at Budgets and stale numbers in an article are worse
 * than no numbers at all. Where a figure matters, the article points at the
 * calculators (which read from a single dated rates configuration) or at a
 * conversation.
 */
export const blogPosts: BlogPost[] = [
  {
    id: "post-accountant-cost",
    slug: "how-much-does-an-accountant-cost-uk",
    title: "How much does an accountant cost in the UK?",
    excerpt:
      "What drives an accountancy fee, what a monthly package usually covers, and the questions worth asking before you agree to anything.",
    categorySlug: "small-business",
    tags: ["pricing", "small business", "choosing an accountant"],
    authorId: "team-1",
    readingMinutes: 6,
    publishedAt: "2026-08-18",
    updatedAt: null,
    status: "published",
    isFeatured: true,
    body: [
      {
        type: "paragraph",
        text: "It is the first question almost everyone asks, and the honest answer is that it depends — but not in the evasive way that phrase usually implies. Accountancy fees are driven by a small number of factors, and once you know what they are you can work out roughly where you will land before you speak to anyone.",
      },
      { type: "heading", level: 2, text: "What actually drives the fee" },
      {
        type: "paragraph",
        text: "Four things move the number more than anything else:",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Your business structure. A sole trader needs a set of accounts and a Self Assessment return. A limited company needs statutory accounts, a Corporation Tax return, a confirmation statement and usually a director's Self Assessment on top. That is more work, and it costs more.",
          "Transaction volume. Not turnover — volume. A consultancy invoicing four clients a month is far less work than a retailer processing two thousand card payments, even at the same revenue.",
          "Whether you need VAT and payroll. Each adds a recurring filing obligation with its own deadline.",
          "Whether you want advisory work. Management accounts and forecasting are a genuinely different service from compliance, and they are priced separately for good reason.",
        ],
      },
      { type: "heading", level: 2, text: "Fixed monthly fees versus hourly" },
      {
        type: "paragraph",
        text: "Most UK firms working with small businesses have moved to fixed monthly fees, and that is generally better for you. You know the cost, it spreads across the year rather than landing as one invoice after year end, and — importantly — you are not paying by the minute to ask a question.",
      },
      {
        type: "paragraph",
        text: "That last point matters more than it sounds. If every email costs money, you stop sending them. Clients on hourly billing routinely make decisions without asking, and the cost of the wrong decision is usually far higher than the cost of the call.",
      },
      { type: "heading", level: 2, text: "What should be included" },
      {
        type: "paragraph",
        text: "Before you agree to anything, get a written scope. At a minimum it should say which filings are covered, how often bookkeeping is done, who your point of contact is, what the turnaround time is, and what falls outside the fee.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Ask this one question",
        text: "\"What is not included?\" A good answer is specific: HMRC enquiry support, one-off restructuring advice, catch-up bookkeeping for prior years. A vague answer is a warning.",
      },
      { type: "heading", level: 2, text: "Cheap is not the same as good value" },
      {
        type: "paragraph",
        text: "The cheapest quote is often cheap because it covers less, or because the work is done at volume with no time allocated to actually looking at your business. A fee that is a few pounds a month higher but includes a planning conversation before your year end will frequently pay for itself several times over.",
      },
      {
        type: "paragraph",
        text: "Equally, expensive does not automatically mean better. What you are looking for is a clear scope, a named person, and a fee that is set out in writing before you commit.",
      },
      { type: "heading", level: 2, text: "Questions worth asking" },
      {
        type: "list",
        ordered: true,
        items: [
          "Who will I actually deal with day to day?",
          "How quickly do you respond to questions, and is there a charge?",
          "What do you need from me, and when?",
          "Do you review my tax position during the year or only after it ends?",
          "What happens if I want to leave?",
        ],
      },
      {
        type: "paragraph",
        text: "If you want a number for your own situation, a short consultation is the fastest route. It takes about half an hour and you will come away with a written quote rather than a range.",
      },
    ],
    seo: {
      title: "How much does an accountant cost in the UK?",
      description:
        "What drives UK accountancy fees, what monthly packages typically include, and the questions to ask before you agree to anything.",
      canonicalPath: "/resources/blog/how-much-does-an-accountant-cost-uk",
    },
    isDemo: true,
  },
  {
    id: "post-sole-trader-vs-limited",
    slug: "sole-trader-vs-limited-company",
    title: "Sole trader vs limited company: which is right for you?",
    excerpt:
      "The trade-offs that actually matter — tax, liability, admin and credibility — and why the answer changes as you grow.",
    categorySlug: "business",
    tags: ["business structure", "sole trader", "limited company"],
    authorId: "team-2",
    readingMinutes: 7,
    publishedAt: "2026-08-04",
    updatedAt: null,
    status: "published",
    isFeatured: true,
    body: [
      {
        type: "paragraph",
        text: "This decision gets framed as a tax question, and tax is part of it. But structure affects your liability, your admin burden, how you get paid and how some clients see you. Getting it right is worth more than a marginal saving in one tax year.",
      },
      { type: "heading", level: 2, text: "The fundamental difference" },
      {
        type: "paragraph",
        text: "As a sole trader, you and the business are legally the same thing. The profit is your income and you are personally responsible for the debts. As a limited company, the business is a separate legal person. It owns its money, it owes its debts, and you take income out of it as salary, dividends or both.",
      },
      {
        type: "paragraph",
        text: "That separation is the source of nearly every other difference between the two.",
      },
      { type: "heading", level: 2, text: "Tax" },
      {
        type: "paragraph",
        text: "A sole trader pays Income Tax and National Insurance on business profit. A limited company pays Corporation Tax on its profit, and then you pay personal tax on whatever you take out — so there are two layers, but the rates and allowances are different at each.",
      },
      {
        type: "paragraph",
        text: "For a long time this made incorporation clearly advantageous above a certain profit level. That gap has narrowed. Dividend tax rates have risen and the dividend allowance has fallen substantially over the past decade, while Corporation Tax now has a tiered structure. The crossover point still exists, but it is lower down the priority list than it used to be, and it moves at every Budget.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Do not decide on a rate you read in an article",
        text: "Rates and thresholds change, sometimes annually. Our calculators are built against a single dated rates configuration so you can see which tax year the figures apply to. Use those for a rough comparison, then get the decision checked against your actual numbers.",
      },
      { type: "heading", level: 2, text: "Liability" },
      {
        type: "paragraph",
        text: "This is the one people underweight. As a sole trader, a claim against the business is a claim against you, and your personal assets are exposed. A limited company puts a legal boundary around that.",
      },
      {
        type: "paragraph",
        text: "The boundary is not absolute — directors have duties, personal guarantees on finance are common, and the protection does not cover fraud or wrongful trading. But for most trading risks it is real, and if you carry meaningful exposure it can matter more than the tax position.",
      },
      { type: "heading", level: 2, text: "Admin" },
      {
        type: "paragraph",
        text: "A sole trader files one Self Assessment return a year. A limited company files statutory accounts with Companies House, a Corporation Tax return with HMRC, a confirmation statement, usually payroll for the director, and the director's own Self Assessment.",
      },
      {
        type: "paragraph",
        text: "There is also a publicity dimension: company accounts and the names of directors are on the public register. Some people mind that and some do not.",
      },
      { type: "heading", level: 2, text: "Credibility and contracts" },
      {
        type: "paragraph",
        text: "In some sectors this is decisive regardless of tax. Larger clients and agencies frequently will not engage with anyone who is not trading through a limited company, and some procurement processes screen on it. If your target clients are corporates, the structure question may already be answered for you.",
      },
      { type: "heading", level: 2, text: "A reasonable way to decide" },
      {
        type: "list",
        ordered: true,
        items: [
          "Start with liability. If you carry real risk, that points one way regardless of tax.",
          "Check whether your clients require a company. If they do, the decision is made.",
          "Then compare the tax position on your realistic profit for the next two years, not last year's.",
          "Weigh the extra admin honestly — it is a real recurring cost in both fees and attention.",
          "Remember you can change later. Incorporating a sole trade is routine.",
        ],
      },
      {
        type: "paragraph",
        text: "If your profit is comfortably into the range where the tax comparison gets close, it is worth half an hour with an accountant rather than an afternoon with a spreadsheet.",
      },
    ],
    seo: {
      title: "Sole trader vs limited company: which is right for you?",
      description:
        "Compare sole trader and limited company structures on tax, liability, admin and credibility — and see why the right answer changes as you grow.",
      canonicalPath: "/resources/blog/sole-trader-vs-limited-company",
    },
    isDemo: true,
  },
  {
    id: "post-corporation-tax-due",
    slug: "when-is-corporation-tax-due",
    title: "When is Corporation Tax due?",
    excerpt:
      "The deadline that catches people out is the payment one, not the filing one — and it comes first.",
    categorySlug: "tax",
    tags: ["corporation tax", "deadlines", "limited company"],
    authorId: "team-2",
    readingMinutes: 4,
    publishedAt: "2026-07-21",
    updatedAt: null,
    status: "published",
    isFeatured: false,
    body: [
      {
        type: "paragraph",
        text: "Corporation Tax has two separate deadlines, and they are not in the order most people assume. You have to pay the tax before you have to file the return that calculates it.",
      },
      { type: "heading", level: 2, text: "The payment deadline comes first" },
      {
        type: "paragraph",
        text: "For most smaller companies, Corporation Tax is payable nine months and one day after the end of the accounting period. The return itself is not due until twelve months after the period end.",
      },
      {
        type: "paragraph",
        text: "So if your year end is 31 March, the tax is due at the start of the following January, but the return is not due until the following March. That three-month gap is where the problems happen: companies wait for the return to be prepared, and by the time it tells them the number, the payment date has already passed and interest is accruing.",
      },
      {
        type: "callout",
        tone: "info",
        title: "The practical fix",
        text: "Have the tax estimated before the payment date rather than after it. If your bookkeeping is current, a reasonable estimate takes very little work and removes the entire problem.",
      },
      { type: "heading", level: 2, text: "Larger companies pay in instalments" },
      {
        type: "paragraph",
        text: "Companies with profits above a set level pay in quarterly instalments instead, and very large companies pay on an accelerated schedule. If you are approaching that territory the payment pattern changes significantly, and it is worth knowing in advance rather than discovering it.",
      },
      { type: "heading", level: 2, text: "What late payment and late filing cost" },
      {
        type: "paragraph",
        text: "Late payment attracts interest from the due date. Late filing attracts penalties that escalate the longer the return is outstanding, and persistent lateness increases them further. Interest rates and penalty amounts are set by HMRC and change, so check the current position rather than relying on a figure from an article.",
      },
      { type: "heading", level: 2, text: "Set aside as you go" },
      {
        type: "paragraph",
        text: "The single most useful habit is putting money aside for tax as it is earned rather than finding it when the bill arrives. A separate account and a rough percentage of profit transferred monthly is enough. Our Corporation Tax estimator will give you a figure to work from.",
      },
      {
        type: "paragraph",
        text: "If you are not sure which deadlines apply to your company, they follow from your accounting reference date, and we can map the whole year out for you in a short call.",
      },
    ],
    seo: {
      title: "When is Corporation Tax due?",
      description:
        "Corporation Tax payment and filing deadlines explained, why payment falls due before the return, and how to avoid interest.",
      canonicalPath: "/resources/blog/when-is-corporation-tax-due",
    },
    isDemo: true,
  },
  {
    id: "post-limited-company-expenses",
    slug: "what-expenses-can-a-limited-company-claim",
    title: "What expenses can a limited company claim?",
    excerpt:
      "The 'wholly and exclusively' test, the categories people miss, and the ones that get challenged.",
    categorySlug: "tax",
    tags: ["expenses", "corporation tax", "limited company"],
    authorId: "team-4",
    readingMinutes: 6,
    publishedAt: "2026-07-07",
    updatedAt: null,
    status: "published",
    isFeatured: false,
    body: [
      {
        type: "paragraph",
        text: "The rule underneath all of this is short: a cost is deductible for Corporation Tax if it is incurred wholly and exclusively for the purposes of the trade. Nearly every argument about expenses is an argument about that phrase.",
      },
      { type: "heading", level: 2, text: "The straightforward ones" },
      {
        type: "list",
        ordered: false,
        items: [
          "Staff salaries, employer National Insurance and employer pension contributions",
          "Premises costs: rent, business rates, utilities, insurance",
          "Software subscriptions and professional tools",
          "Accountancy and legal fees relating to the trade",
          "Business travel and accommodation, excluding ordinary commuting",
          "Marketing and advertising",
          "Equipment, usually through capital allowances rather than as a straight deduction",
        ],
      },
      { type: "heading", level: 2, text: "The ones people miss" },
      {
        type: "paragraph",
        text: "Employer pension contributions made by the company are frequently overlooked and are one of the more effective ways of extracting value. Working-from-home costs for directors, use of a personal vehicle at approved mileage rates, professional subscriptions relevant to the trade, and pre-trading expenditure in the period before the company started trading all get forgotten regularly.",
      },
      { type: "heading", level: 2, text: "The ones that get challenged" },
      {
        type: "paragraph",
        text: "Anything with a personal element attracts scrutiny, because the test is exclusivity. Client entertaining is specifically disallowed for Corporation Tax. Clothing is not deductible unless it is genuine protective wear or a uniform. A car provided to a director creates a taxable benefit, which frequently costs more in personal tax than the company saves.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Mixed-use costs need care",
        text: "A phone contract, a laptop or a room at home used partly for business and partly personally cannot simply be claimed in full. There are established ways to apportion these — use them rather than guessing.",
      },
      { type: "heading", level: 2, text: "Records are the actual requirement" },
      {
        type: "paragraph",
        text: "A claim you cannot evidence is a claim you may lose. Keep receipts, keep them in a system rather than a drawer, and record what the cost was for when it is not obvious. Receipt capture apps have made this genuinely quick, and they remove the single most common reason people under-claim: they lost the paperwork.",
      },
      {
        type: "paragraph",
        text: "If you are unsure whether something qualifies, ask before you claim it. The conversation takes two minutes and is considerably cheaper than an enquiry.",
      },
    ],
    seo: {
      title: "What expenses can a limited company claim?",
      description:
        "Allowable limited company expenses explained: the wholly and exclusively test, commonly missed claims, and the costs HMRC challenges.",
      canonicalPath:
        "/resources/blog/what-expenses-can-a-limited-company-claim",
    },
    isDemo: true,
  },
  {
    id: "post-vat-registration",
    slug: "when-should-a-business-register-for-vat",
    title: "When should a business register for VAT?",
    excerpt:
      "The rolling twelve-month test, the forward-looking test, and why registering early is sometimes the right call.",
    categorySlug: "vat",
    tags: ["vat", "registration", "thresholds"],
    authorId: "team-4",
    readingMinutes: 5,
    publishedAt: "2026-06-23",
    updatedAt: null,
    status: "published",
    isFeatured: false,
    body: [
      {
        type: "paragraph",
        text: "There are two separate tests for compulsory VAT registration, and businesses tend to only know about the first one.",
      },
      { type: "heading", level: 2, text: "The backward-looking test" },
      {
        type: "paragraph",
        text: "You must register if your VAT-taxable turnover over the previous twelve months exceeds the registration threshold. The critical word is rolling: it is any twelve-month period, not your financial year. A strong quarter can push you over even if the year as a whole looks comfortable.",
      },
      { type: "heading", level: 2, text: "The forward-looking test" },
      {
        type: "paragraph",
        text: "You must also register if you expect to exceed the threshold within the next thirty days alone. This one catches businesses that win a single large contract. It can be triggered on the day you sign, and it does not matter that your historic turnover is nowhere near the threshold.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Check the current threshold",
        text: "The registration and deregistration thresholds are set by HMRC and can change at a Budget. Our VAT calculator shows the figures it is using and the tax year they apply to.",
      },
      { type: "heading", level: 2, text: "Voluntary registration" },
      {
        type: "paragraph",
        text: "You can register below the threshold, and it is sometimes worth doing. If your customers are themselves VAT-registered businesses, they reclaim the VAT you charge, so it costs them nothing — and you get to reclaim VAT on your own costs.",
      },
      {
        type: "paragraph",
        text: "If you sell mainly to consumers, the calculation is different. You either absorb the VAT and lose margin, or add it and become more expensive overnight. That is a real commercial decision, not just an administrative one.",
      },
      { type: "heading", level: 2, text: "Which scheme" },
      {
        type: "paragraph",
        text: "Standard accounting is the default. Cash accounting means you account for VAT when money moves rather than when invoices are raised, which helps if customers pay slowly. The Flat Rate Scheme simplifies the calculation for smaller businesses but limits what you can reclaim. Annual accounting reduces the number of returns. Which one suits you depends on your margins, your customers and your payment cycles.",
      },
      { type: "heading", level: 2, text: "Making Tax Digital" },
      {
        type: "paragraph",
        text: "VAT-registered businesses must keep digital records and file through compatible software. In practice this means your bookkeeping needs to be in a proper system before you register, not after.",
      },
      {
        type: "paragraph",
        text: "If you are within sight of the threshold, the useful thing is to monitor the rolling figure monthly. That is something an accountant should be doing for you as a matter of course.",
      },
    ],
    seo: {
      title: "When should a business register for VAT?",
      description:
        "UK VAT registration explained: the rolling twelve-month test, the thirty-day forward test, voluntary registration and choosing a scheme.",
      canonicalPath: "/resources/blog/when-should-a-business-register-for-vat",
    },
    isDemo: true,
  },
  {
    id: "post-year-end-prep",
    slug: "how-to-prepare-for-year-end-accounts",
    title: "How to prepare for your year-end accounts",
    excerpt:
      "A practical checklist that turns year end from a three-week reconstruction into a one-week review.",
    categorySlug: "accounting",
    tags: ["year end", "accounts", "bookkeeping"],
    authorId: "team-5",
    readingMinutes: 5,
    publishedAt: "2026-06-09",
    updatedAt: null,
    status: "published",
    isFeatured: false,
    body: [
      {
        type: "paragraph",
        text: "Year end is only painful when it is the first time anyone has looked properly at the records. If the bookkeeping has been kept current, preparing accounts is a review. If it has not, it is a reconstruction, and reconstruction is slow, expensive and prone to missing things you were entitled to claim.",
      },
      { type: "heading", level: 2, text: "Before the year end" },
      {
        type: "list",
        ordered: false,
        items: [
          "Reconcile every bank and card account to the closing statement.",
          "Chase outstanding customer invoices — and decide honestly which are not going to be paid.",
          "Review your fixed asset list and remove anything you no longer have.",
          "Count stock if you carry it, and record the basis of valuation.",
          "Talk to your accountant about timing: some decisions are worth making before the year ends rather than after.",
        ],
      },
      { type: "heading", level: 2, text: "What your accountant will ask for" },
      {
        type: "list",
        ordered: false,
        items: [
          "Bank statements covering the full period",
          "Sales invoices and purchase invoices or receipts",
          "Loan and finance agreements",
          "Payroll records for the year",
          "VAT returns filed during the period",
          "Details of anything unusual — an asset sold, a grant, a dispute, a large one-off cost",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Flag the unusual things yourself",
        text: "A one-off transaction that looks odd in the ledger will generate questions and delay. Thirty seconds of explanation from you saves a round trip.",
      },
      { type: "heading", level: 2, text: "The habit that removes the problem" },
      {
        type: "paragraph",
        text: "Reconcile monthly. It takes a fraction of the time when the transactions are recent and you can still remember what they were, and it means the numbers you look at during the year are numbers you can act on. Year end then becomes a review of twelve months you have already checked.",
      },
      {
        type: "paragraph",
        text: "It also means your tax estimate is reliable, which is the difference between planning for a bill and being surprised by one.",
      },
    ],
    seo: {
      title: "How to prepare for your year-end accounts",
      description:
        "A practical checklist for UK year-end accounts: what to reconcile, what your accountant needs, and the habit that makes it straightforward.",
      canonicalPath: "/resources/blog/how-to-prepare-for-year-end-accounts",
    },
    isDemo: true,
  },
  {
    id: "post-contractors-accountant",
    slug: "do-contractors-need-an-accountant",
    title: "Do contractors need an accountant?",
    excerpt:
      "What a contractor accountant actually does beyond filing, and when doing it yourself stops making sense.",
    categorySlug: "contractors",
    tags: ["contractors", "limited company", "ir35"],
    authorId: "team-4",
    readingMinutes: 5,
    publishedAt: "2026-05-26",
    updatedAt: null,
    status: "published",
    isFeatured: false,
    body: [
      {
        type: "paragraph",
        text: "You are not legally required to have one. Plenty of contractors file their own accounts and returns. The question is whether the time and the risk are a good trade for the fee.",
      },
      { type: "heading", level: 2, text: "What the compliance load actually is" },
      {
        type: "paragraph",
        text: "A contractor operating through a limited company typically has: statutory accounts, a Corporation Tax return, a confirmation statement, payroll with RTI submissions for the director, possibly VAT returns each quarter, and a personal Self Assessment. That is several separate deadlines with several separate penalty regimes.",
      },
      { type: "heading", level: 2, text: "Where the value sits beyond filing" },
      {
        type: "paragraph",
        text: "Filing is the visible part, but it is rarely where the money is. Three things matter more:",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Profit extraction. The split between salary, dividends and pension contributions is worth reviewing every year, because the rates and thresholds behind it move.",
          "Off-payroll working status. The rules on who determines status and who bears the liability have changed more than once. Getting this wrong is expensive, and it is engagement-by-engagement rather than a one-off decision.",
          "Timing. Contract income arrives unevenly. When you take money out, and in which tax year, can change the outcome meaningfully.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Status is not a settled question",
        text: "Off-payroll working rules have been reformed repeatedly. If your last review was more than a year or two ago, it is worth revisiting rather than assuming the position still holds.",
      },
      { type: "heading", level: 2, text: "When self-filing stops making sense" },
      {
        type: "paragraph",
        text: "Roughly: when you start having to look things up. If you are researching whether something is claimable, how to treat an engagement, or what the current dividend position is, you are spending billable hours on work that costs less to buy than to do.",
      },
      {
        type: "paragraph",
        text: "For most contractors the monthly fee is under a single billable hour. That is usually the whole argument.",
      },
    ],
    seo: {
      title: "Do contractors need an accountant?",
      description:
        "What a contractor accountant does beyond filing — profit extraction, off-payroll status and timing — and when self-filing stops making sense.",
      canonicalPath: "/resources/blog/do-contractors-need-an-accountant",
    },
    isDemo: true,
  },
];
