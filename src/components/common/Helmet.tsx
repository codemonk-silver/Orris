import { useEffect } from 'react';

interface HelmetProps {
  title: string;
  description: string;
  canonicalUrl?: string;
}

export default function Helmet({ title, description, canonicalUrl }: HelmetProps) {
  useEffect(() => {
    // 1. Set the document title
    document.title = title;

    // 2. Set the meta description tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Set the canonical URL link tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    // Determine the precise canonical URL
    const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '');
    if (canonical) {
      canonicalLink.setAttribute('href', canonical);
    }

    // Cleanup isn't strictly necessary for document headers in simple SPAs,
    // but ensures crisp, exact transitions between distinct view mounts.
  }, [title, description, canonicalUrl]);

  return null;
}
