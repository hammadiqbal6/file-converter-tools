export type Guide = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  datePublished: string;
  dateModified: string;
  relatedTools: string[];
  relatedGuides?: string[];
  answerFirst: string;
  sections: { h2: string; html: string }[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; href: string }[];
  takeaways: string[];
};
