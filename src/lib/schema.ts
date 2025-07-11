import { SITE_CONFIG } from "./metadata";

// Enhanced schema markup for better SEO
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: "id-ID",
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "Periodical",
      name: SITE_CONFIG.name,
      issn: "2999-1234", // Add your ISSN if available
      publisher: {
        "@type": "Organization",
        name: SITE_CONFIG.publisher,
      },
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.publisher,
    url: SITE_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      width: 512,
      height: 512,
    },
    description: "Universitas yang menerbitkan jurnal ilmiah berkualitas tinggi",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
      addressLocality: "Indonesia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@example.com", // Replace with actual email
    },
    sameAs: [
      // Add social media links if available
      // "https://facebook.com/yourpage",
      // "https://twitter.com/yourhandle",
    ],
  };
}

export function generateArticleSchema(article: {
  title: string;
  abstract?: string;
  authors?: string[];
  publishedDate?: string;
  modifiedDate?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    description: article.abstract,
    author: article.authors?.map((author) => ({
      "@type": "Person",
      name: author,
    })),
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.publisher,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
      },
    },
    isPartOf: {
      "@type": "Periodical",
      name: SITE_CONFIG.name,
      issn: "2999-1234", // Add your ISSN if available
    },
    keywords: article.keywords?.join(", "),
    url: article.url,
    ...(article.doi && { identifier: article.doi }),
    inLanguage: "id-ID",
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/", // Adjust license as needed
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateCollectionPageSchema(
  title: string,
  description: string,
  items: Array<{ title: string; url: string; description?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: SITE_CONFIG.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: item.url,
        description: item.description,
      })),
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}
