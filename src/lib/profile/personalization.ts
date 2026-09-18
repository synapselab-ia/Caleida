export const PROFILE_BIO_MAX_LENGTH = 280;
export const PROFILE_LINK_MAX_COUNT = 5;
export const PROFILE_LINK_MAX_LENGTH = 512;
export const PROFILE_CATEGORY_MAX_COUNT = 3;

export const PROFILE_ACCENT_TOKENS = [
  "violet",
  "magenta",
  "blue",
  "green",
  "amber",
] as const;

export type ProfileAccentToken = (typeof PROFILE_ACCENT_TOKENS)[number];

export const PROFILE_CATEGORIES = [
  "book",
  "manga",
  "manhwa",
  "manhua",
  "movie",
  "series",
  "anime",
] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export function isProfileAccentToken(value: string): value is ProfileAccentToken {
  return (PROFILE_ACCENT_TOKENS as readonly string[]).includes(value);
}

export function isProfileCategory(value: string): value is ProfileCategory {
  return (PROFILE_CATEGORIES as readonly string[]).includes(value);
}
