import { SourceId } from './sources';

export type ChannelId = 'email' | 'slack';

/** `rules/{ruleId}` (design.md §1). */
export interface Rule {
  id: string;
  userId: string;
  name: string;
  sourceIds: SourceId[];
  /** Lower-cased and trimmed on save. */
  keywords: string[];
  channels: ChannelId[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** What the form provides; the service adds the owner, `active` and the timestamps. */
export type NewRule = Pick<Rule, 'name' | 'sourceIds' | 'keywords' | 'channels'>;

/** What an owner can edit (#32); channels stay as they are. */
export type RuleChanges = Pick<Rule, 'name' | 'sourceIds' | 'keywords'>;
