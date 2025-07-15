import { Metadata } from "next";

export interface OpenGraphConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  siteName?: string;
  locale?: string;
  authors?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface TwitterConfig {
  card?: "summary" | "summary_large_image" | "app" | "player";
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: OpenGraphConfig;
  twitter?: TwitterConfig;
  robots?: string;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

// Default site configuration
export const SITE_CONFIG = {
  name: "Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA)",
  shortName: "JEBAKA",
  description:
    "Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) adalah jurnal peer-review dan open-access yang diterbitkan oleh Universitas Percobaan Nanda. Platform terkemuka untuk publikasi penelitian inovatif di bidang Ekonomi dan Akuntansi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mtrinanda.my.id",
  ogImage: "/images/og-default.png",
  // Enhanced SEO fields
  keywords: [
    "jurnal ekonomi",
    "jurnal akuntansi",
    "jurnal mahasiswa",
    "penelitian ekonomi",
    "penelitian akuntansi",
    "open access",
    "peer review",
    "publikasi ilmiah",
    "universitas percobaan nanda",
    "JEBAKA",
    "artikel ekonomi",
    "artikel akuntansi",
    "jurnal ilmiah",
    "ekonomi bisnis",
    "akuntansi mahasiswa",
  ],
  author: "Universitas Percobaan Nanda",
  category: "Education",
  language: "id-ID",
  logo: "/jimeka-logo.webp",
  favicon: "/favicon.ico",
  authors: ["Universitas Percobaan Nanda"],
  creator: "@jimeka_journal",
  publisher: "Universitas Percobaan Nanda",
  locale: "id_ID",
  type: "website" as const,
} as const;

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    openGraph = {},
    twitter = {},
    robots = "index, follow",
    alternates = {},
  } = config;

  // Construct full title
  const fullTitle =
    title === SITE_CONFIG.shortName
      ? SITE_CONFIG.name
      : `${title} | ${SITE_CONFIG.shortName}`;

  // Default Open Graph configuration
  const ogConfig: OpenGraphConfig = {
    title: fullTitle,
    description,
    image: SITE_CONFIG.ogImage,
    url: canonical || SITE_CONFIG.url,
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    ...openGraph,
  };

  // Default Twitter configuration
  const twitterConfig: TwitterConfig = {
    card: "summary_large_image",
    site: SITE_CONFIG.creator,
    creator: SITE_CONFIG.creator,
    title: fullTitle,
    description,
    image: ogConfig.image,
    ...twitter,
  };

  // Combine default and custom keywords
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];

  const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url),
    title: fullTitle,
    description,
    keywords: allKeywords.join(", "),
    authors: [{ name: SITE_CONFIG.publisher }],
    creator: SITE_CONFIG.publisher,
    publisher: SITE_CONFIG.publisher,
    robots,

    // Open Graph
    openGraph: {
      title: ogConfig.title,
      description: ogConfig.description,
      url: ogConfig.url,
      siteName: ogConfig.siteName,
      images: [
        {
          url: ogConfig.image!,
          width: 1200,
          height: 630,
          alt: ogConfig.title,
        },
      ],
      locale: ogConfig.locale,
      type: ogConfig.type || "website",
      ...(ogConfig.type === "article" && {
        publishedTime: ogConfig.publishedTime,
        modifiedTime: ogConfig.modifiedTime,
        section: ogConfig.section,
        authors: ogConfig.authors,
        tags: ogConfig.tags,
      }),
    },

    // Twitter
    twitter: {
      card: twitterConfig.card || "summary_large_image",
      site: twitterConfig.site,
      creator: twitterConfig.creator,
      title: twitterConfig.title,
      description: twitterConfig.description,
      images: twitterConfig.image ? [twitterConfig.image] : undefined,
    },

    // Additional meta tags for better SEO
    other: {
      "google-site-verification": "2QDyIzWuQi8ND4icZkWix-PsDxAI1HnxTQC_fbPos-s",
      "theme-color": "#ffffff",
      "color-scheme": "light dark",
      "format-detection": "telephone=no",
      "msapplication-TileColor": "#ffffff",
      "msapplication-config": "/browserconfig.xml",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": SITE_CONFIG.shortName,
      "application-name": SITE_CONFIG.shortName,
      "mobile-web-app-capable": "yes",
      HandheldFriendly: "True",
      MobileOptimized: "320",
      referrer: "no-referrer-when-downgrade",
    },

    // Alternates
    alternates: {
      canonical: canonical || SITE_CONFIG.url,
      ...alternates,
    },

    // Icons
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/jimeka-logo.webp", sizes: "32x32", type: "image/webp" },
      ],
      shortcut: "/favicon.ico",
      apple: "/jimeka-logo.webp",
    },

    // Verification (add your verification codes here)
    verification: {
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
      // yahoo: "your-yahoo-verification-code",
    },
  };

  return metadata;
}

/**
 * Generate metadata for article pages
 */
export function generateArticleMetadata(article: {
  title: string;
  abstract?: string;
  authors?: string[];
  publishedDate?: string;
  modifiedDate?: string;
  keywords?: string[];
  doi?: string;
  slug?: string;
}): Metadata {
  const {
    title,
    abstract = "",
    authors = [],
    publishedDate,
    modifiedDate,
    keywords = [],
    slug,
  } = article;

  const canonical = slug ? `${SITE_CONFIG.url}/articles/${slug}` : undefined;

  return generateMetadata({
    title,
    description: abstract || `Artikel ilmiah: ${title}`,
    keywords: [...keywords, "artikel", "penelitian", "ilmiah"],
    canonical,
    openGraph: {
      type: "article",
      authors,
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      section: "Artikel",
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
    },
  });
}

/**
 * Generate metadata for announcement pages
 */
export function generateAnnouncementMetadata(announcement: {
  title: string;
  content?: string;
  publishedDate?: string;
  slug?: string;
}): Metadata {
  const { title, content = "", publishedDate, slug } = announcement;

  const canonical = slug
    ? `${SITE_CONFIG.url}/announcements/${slug}`
    : undefined;

  return generateMetadata({
    title,
    description: content.slice(0, 160) || `Pengumuman: ${title}`,
    keywords: ["pengumuman", "berita", "informasi"],
    canonical,
    openGraph: {
      type: "article",
      publishedTime: publishedDate,
      section: "Pengumuman",
    },
  });
}

/**
 * Generate structured data (JSON-LD) for the organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
    description: SITE_CONFIG.description,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      url: `${SITE_CONFIG.url}/contact`,
    },
    sameAs: [
      // Add social media URLs here
      // "https://twitter.com/jimeka_journal",
      // "https://facebook.com/jimeka.journal",
    ],
  };
}

/**
 * Generate structured data for articles
 */
export function generateArticleStructuredData(article: {
  title: string;
  abstract?: string;
  authors?: string[];
  publishedDate?: string;
  doi?: string;
  url?: string;
}) {
  const { title, abstract, authors = [], publishedDate, doi, url } = article;

  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: title,
    description: abstract,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author,
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
    datePublished: publishedDate,
    url,
    ...(doi && { identifier: doi }),
    isPartOf: {
      "@type": "Periodical",
      name: SITE_CONFIG.name,
      issn: "1234-5678", // E-ISSN for JEBAKA
    },
  };
}

/**
 * Generate structured data for website
 */
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
