import { KnownSchools } from "@/constants/schools";

export const dailyAnnouncementsRichTitlesData: Record<
  KnownSchools,
  { title: string; emoji: string }[]
> = {
  [KnownSchools.MarkIsfeld]: [
    {
      title: "Today",
      emoji: "✨",
    },
    {
      title: "Sports",
      emoji: "🏆",
    },
    {
      title: "Re-runs",
      emoji: "📆",
    },
    {
      title: "Career Centre",
      emoji: "💼",
    },
    {
      title: "Bursaries & Scholarships",
      emoji: "💵",
    },
    {
      title: "Grads",
      emoji: "🧑‍🎓",
    },
  ],

  [KnownSchools.GPVanier]: [
    {
      title: "Today",
      emoji: "✨",
    },
    {
      title: "Meetings & Practices",
      emoji: "🧩",
    },

    {
      title: "Volunteer / Careers",
      emoji: "💼",
    },
    {
      title: "Bursaries & Scholarships",
      emoji: "💵",
    },
    {
      title: "Older News",
      emoji: "📆",
    },
  ],
};
