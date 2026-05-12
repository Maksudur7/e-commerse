export const slugify = (text: string): string => {
  const baseSlug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
    
  return `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
};
