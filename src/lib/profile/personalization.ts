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


export const PROFILE_VISIBILITIES = [
  "public",
  "followers",
  "connections",
  "only_me",
] as const;

export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export const PROFILE_EDITABLE_VISIBILITIES = ["public", "only_me"] as const;
export type EditableProfileVisibility = (typeof PROFILE_EDITABLE_VISIBILITIES)[number];

export function isProfileVisibility(value: string): value is ProfileVisibility {
  return (PROFILE_VISIBILITIES as readonly string[]).includes(value);
}

export function isEditableProfileVisibility(value: string): value is EditableProfileVisibility {
  return (PROFILE_EDITABLE_VISIBILITIES as readonly string[]).includes(value);
}
