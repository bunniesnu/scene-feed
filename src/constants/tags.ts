export const TAG_CATEGORIES = [
  "member",
  "content",
  "platform",
  "source",
  "topic",
] as const;

export type TagCategory = (typeof TAG_CATEGORIES)[number];

export const TAG_LABEL: Record<TagCategory, string> = {
  "member": "멤버",
  "content": "종류",
  "platform": "플랫폼",
  "source": "출처",
  "topic": "주제"
}