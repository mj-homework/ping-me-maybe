import { Component, computed, effect, inject, signal } from '@angular/core';
import { Rule } from '../../core/models/rule';
import { SOURCE_OPTIONS, SourceId } from '../../core/models/sources';
import { AuthService } from '../../core/services/auth';
import { RulesService, normalizeKeywords } from '../../core/services/rules';

/** Limits from `firestore.rules`; the form checks them first so the write is not rejected. */
const MAX_NAME_LENGTH = 80;
const MAX_KEYWORDS = 20;

@Component({
  selector: 'app-alerts-page',
  template: `
    <h1>Alerts</h1>
    @if (!auth.ready()) {
      <p>Loading...</p>
    } @else if (!auth.user()) {
      <p>Sign in to create rules.</p>
    } @else {
      <form (submit)="$event.preventDefault(); create()">
        <h2>New rule</h2>
        <label>
          Name
          <input
            #nameInput
            [value]="name()"
            (input)="name.set(nameInput.value)"
            [maxLength]="maxNameLength"
            required
          />
        </label>
        <p></p>
        <fieldset>
          <legend>Sources</legend>
          @for (source of sourceOptions; track source.id) {
            <label>
              <input
                #box
                type="checkbox"
                [checked]="sourceIds().includes(source.id)"
                (change)="toggleSource(source.id, box.checked)"
              />
              {{ source.name }}
            </label>
          }
        </fieldset>
        <p></p>
        <label>
          Keywords (comma-separated, any one matches)
          <input
            #keywordsInput
            [value]="keywordsText()"
            (input)="keywordsText.set(keywordsInput.value)"
            placeholder="earthquake, flood"
          />
        </label>
        @if (keywords().length > maxKeywords) {
          <p>At most {{ maxKeywords }} keywords.</p>
        }
        <p></p>
        <fieldset>
          <legend>Channels</legend>
          <label><input type="checkbox" checked disabled /> Email</label>
          <label><input type="checkbox" disabled /> Slack (coming later)</label>
        </fieldset>
        <p></p>
        <button type="submit" [disabled]="!valid() || saving()">Create rule</button>
      </form>

      @if (writeError(); as message) {
        <p role="alert">Could not save: {{ message }}</p>
      }

      <h2>My rules</h2>
      @if (loadError(); as message) {
        <p role="alert">Could not load rules: {{ message }}</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Sources</th>
              <th>Keywords</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (rule of rules(); track rule.id) {
              <tr>
                <td>{{ rule.name }}</td>
                <td>{{ sourceNames(rule) }}</td>
                <td>{{ rule.keywords.join(', ') }}</td>
                <td>{{ rule.active ? 'active' : 'paused' }}</td>
                <td>
                  <button type="button" (click)="setActive(rule, !rule.active)">
                    {{ rule.active ? 'Pause' : 'Resume' }}
                  </button>
                  <button type="button" (click)="remove(rule)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No rules yet.</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class AlertsPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly rulesService = inject(RulesService);

  protected readonly sourceOptions = SOURCE_OPTIONS;
  protected readonly maxNameLength = MAX_NAME_LENGTH;
  protected readonly maxKeywords = MAX_KEYWORDS;

  protected readonly name = signal('');
  protected readonly sourceIds = signal<SourceId[]>([]);
  protected readonly keywordsText = signal('');
  protected readonly keywords = computed(() => normalizeKeywords(this.keywordsText().split(',')));
  protected readonly valid = computed(() => {
    const name = this.name().trim();
    const count = this.keywords().length;
    return (
      name.length > 0 &&
      name.length <= MAX_NAME_LENGTH &&
      this.sourceIds().length > 0 &&
      count > 0 &&
      count <= MAX_KEYWORDS
    );
  });

  protected readonly saving = signal(false);
  protected readonly writeError = signal<string | null>(null);
  protected readonly rules = signal<Rule[]>([]);
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    // Re-subscribe whenever the signed-in user changes; the cleanup drops the old listener.
    effect((onCleanup) => {
      const user = this.auth.user();
      this.rules.set([]);
      this.loadError.set(null);
      if (!user) return;
      const unsubscribe = this.rulesService.watchMine(
        user.uid,
        (rules) => this.rules.set(rules),
        (err) => this.loadError.set(err.message),
      );
      onCleanup(unsubscribe);
    });
  }

  protected toggleSource(id: SourceId, checked: boolean): void {
    this.sourceIds.update((ids) => (checked ? [...ids, id] : ids.filter((s) => s !== id)));
  }

  protected sourceNames(rule: Rule): string {
    return rule.sourceIds
      .map((id) => SOURCE_OPTIONS.find((s) => s.id === id)?.name ?? id)
      .join(', ');
  }

  protected async create(): Promise<void> {
    if (!this.valid()) return;
    this.saving.set(true);
    const ok = await this.write(() =>
      this.rulesService.create({
        name: this.name(),
        sourceIds: this.sourceIds(),
        keywords: this.keywords(),
        channels: ['email'],
      }),
    );
    this.saving.set(false);
    if (ok) {
      this.name.set('');
      this.sourceIds.set([]);
      this.keywordsText.set('');
    }
  }

  protected async setActive(rule: Rule, active: boolean): Promise<void> {
    await this.write(() => this.rulesService.setActive(rule.id, active));
  }

  protected async remove(rule: Rule): Promise<void> {
    if (!confirm(`Delete the rule "${rule.name}"?`)) return;
    await this.write(() => this.rulesService.delete(rule.id));
  }

  /** Runs a write and shows the Firestore error text if it fails. */
  private async write(action: () => Promise<void>): Promise<boolean> {
    this.writeError.set(null);
    try {
      await action();
      return true;
    } catch (err) {
      this.writeError.set(err instanceof Error ? err.message : String(err));
      return false;
    }
  }
}
