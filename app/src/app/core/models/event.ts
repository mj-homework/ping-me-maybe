/** The fields of `events/{eventId}` (design.md §1) that the admin list shows. */
export interface EventListItem {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  publishedAt: Date;
}
