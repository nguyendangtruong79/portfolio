/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROFILE CONFIG — single source of truth for personal details.
 *  Updated directly from: Nguyen_Dang_Truong_Senior_Software_Engineer.docx
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const profile = {
  name: "Nguyen Dang Truong",
  handle: "ndtruong",
  title: "Senior Frontend Engineer · Tech Lead",
  subTitle: "Frontend-focused with Mobile (React Native) & Backend Familiarity",
  location: "Hanoi, Vietnam · Remote-friendly (UTC+7)",
  availability: "Available for Senior, Tech Lead & Staff Roles",
  phone: "(+84) 967 673 814",
  email: "truong.nd2706@gmail.com",
  resumeUrl: "/Nguyen_Dang_Truong_Senior_Software_Engineer.docx",
  siteUrl: "https://ndtruong.dev",
  socials: {
    github: "https://github.com/nguyendangtruong79",
    linkedin: "https://www.linkedin.com/in/%C4%91%C4%83ng-tr%C6%B0%E1%BB%9Dng-nguy%E1%BB%85n-36b297422/",
  },
  yearsOfExperience: "6.5+",
  certifications: [
    "Claude Certified Architect — Agentic Architecture, Workflows & AI Systems (2025)",
    "English: B2 (CEFR) — Professional Collaboration",
  ],
  education: [
    "Aptech Computer Education — Advanced Diploma in Software Engineering (2019)",
    "Ngo Quyen University — Higher Education Degree (2017)",
  ],
  pgpFingerprint: "8F1A 4C3E 9B2D 77A1 E2C9  1D5F 3B84 A9E2 28C6 7D01",
} as const;

export type Profile = typeof profile;
