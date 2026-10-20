import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { Rule } from '../../core/models/rule';
import { SourceId, sourceName } from '../../core/models/sources';
import { RulesService } from '../../core/services/rules';
import { AdminNavComponent } from './admin-nav';

const MAX_RULES = 50;

@Component({
  selector: 'app-admin-rules-page',
  imports: [AdminNavComponent, DatePipe, SlicePipe],
  template: `
    <app-admin-nav />
    <h1>Rules</h1>
    @if (error(); as message) {
      <p role="alert">Could not load rules: {{ message }}</p>
    } @else if (loading()) {
      <p>Loading…</p>
    } @else {
      <p>Newest {{ rules().length }} rules of all users (max {{ maxRules }}), by created time.</p>
      <table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Name</th>
            <th>Sources</th>
            <th>Keywords</th>
            <th>Channels</th>
            <th>Active</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (rule of rules(); track rule.id) {
            <tr>
              <td>
                <code [title]="rule.userId">{{ rule.userId | slice: 0 : 8 }}…</code>
              </td>
              <td>{{ rule.name }}</td>
              <td>{{ sourceNames(rule.sourceIds) }}</td>
              <td>{{ rule.keywords.join(', ') }}</td>
              <td>{{ rule.channels.join(', ') }}</td>
              <td>{{ rule.active ? 'yes' : 'no' }}</td>
              <td>{{ rule.createdAt | date: 'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <button type="button" disabled title="Coming later (C4)">Disable</button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="8">No rules yet. Users create them on the Alerts page.</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class AdminRulesPageComponent {
  protected readonly maxRules = MAX_RULES;
  protected readonly rules = signal<Rule[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const unsubscribe = inject(RulesService).watchAll(
      MAX_RULES,
      (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      (err) => this.error.set(err.message),
    );
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  /** Display names via `sourceName()`; an unknown ID is shown as it is. */
  protected sourceNames(ids: readonly SourceId[]): string {
    return ids.map(sourceName).join(', ');
  }
}
