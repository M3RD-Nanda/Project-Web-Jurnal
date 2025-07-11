import { Metadata } from "next";

export const SITE_CONFIG = {
  name: "Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA)",
  shortName: "JIMEKA",
  description:
    "Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) adalah jurnal peer-review dan open-access yang diterbitkan oleh Fakultas Ekonomi dan Bisnis, Universitas Percobaan Nanda.",
  url: "https://jimeka.vercel.app", // Replace with actual URL
  ogImage: "https://jimeka.vercel.app/og.png", // Replace with actual OG image URL
  author: "Muhammad Trinanda",
  twitter: "@mtrinanda",
};

type GenerateMetadataOptions = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
};

export function generateMetadata({
  title,
  description,
  canonical,
  openGraph,
  twitter,
}: GenerateMetadataOptions): Metadata {
  const pageTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.name;
  const pageDescription = description || SITE_CONFIG.description;
  const pageUrl = canonical || SITE_CONFIG.url;

  // Safely get the first image URL, whether it's an object or an array
  const ogImages = openGraph?.images;
  const firstImage = ogImages ? (Array.isArray(ogImages) ? ogImages[0] : ogImages) : undefined;
  
  let imageUrl: string | URL | undefined;
  if (typeof firstImage === 'string') {
    imageUrl = firstImage;
  } else if (firstImage instanceof URL) {
    imageUrl = firstImage;
  } else if (firstImage?.url) {
    imageUrl = firstImage.url;
  }
  const finalImageUrl = imageUrl?.toString() || SITE_CONFIG.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: ["Jurnal", "Ekonomi", "Akuntansi", "JIMEKA", "Penelitian"],
    authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.author,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: "id_ID",
      type: "website",
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [finalImageUrl],
      creator: SITE_CONFIG.twitter,
      ...twitter,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: `${SITE_CONFIG.url}/site.webmanifest`,
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/jimeka-logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-000-0000-0000",
      contactType: "customer service",
    },
  };
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}