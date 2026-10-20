import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EventListItem } from '../../core/models/event';
import { sourceName } from '../../core/models/sources';
import { EventsService } from '../../core/services/events';
import { PollingService, SourcePollResult } from '../../core/services/polling';
import { AdminNavComponent } from './admin-nav';

const MAX_EVENTS = 50;

@Component({
  selector: 'app-admin-events-page',
  imports: [AdminNavComponent, DatePipe],
  template: `
    <app-admin-nav />
    <h1>Events</h1>
    <p>
      <button type="button" [disabled]="fetching()" (click)="fetchNow()">
        {{ fetching() ? 'Fetching…' : 'Fetch now' }}
      </button>
      Polls all sources once (replay data), same code as <code>npm run poll:replay</code>.
    </p>
    @if (fetchError(); as message) {
      <p role="alert">Fetch failed: {{ message }}</p>
    }
    @if (fetchResults(); as results) {
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Created</th>
            <th>Skipped</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          @for (result of results; track result.sourceId) {
            <tr>
              <td>{{ sourceName(result.sourceId) }}</td>
              <td>{{ result.created }}</td>
              <td>{{ result.skipped }}</td>
              <td>{{ result.error }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
    @if (error(); as message) {
      <p role="alert">Could not load events: {{ message }}</p>
    } @else if (loading()) {
      <p>Loading…</p>
    } @else {
      <p>Newest {{ events().length }} events (max {{ maxEvents }}), by published time.</p>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Title</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          @for (event of events(); track event.id) {
            <tr>
              <td>{{ sourceName(event.sourceId) }}</td>
              <td>
                <a [href]="event.url" target="_blank" rel="noopener noreferrer">{{
                  event.title
                }}</a>
              </td>
              <td>{{ event.publishedAt | date: 'yyyy-MM-dd HH:mm' }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3">
                No events yet. Click <strong>Fetch now</strong>, or run
                <code>npm run poll:replay</code> in functions/.
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class AdminEventsPageComponent {
  private readonly polling = inject(PollingService);
  protected readonly maxEvents = MAX_EVENTS;
  protected readonly sourceName = sourceName;
  protected readonly events = signal<EventListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly fetching = signal(false);
  protected readonly fetchResults = signal<SourcePollResult[] | null>(null);
  protected readonly fetchError = signal<string | null>(null);

  constructor() {
    const unsubscribe = inject(EventsService).watchLatest(
      MAX_EVENTS,
      (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      (err) => this.error.set(err.message),
    );
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  /** New events show up in the list by themselves (live query). */
  protected async fetchNow(): Promise<void> {
    this.fetching.set(true);
    this.fetchError.set(null);
    this.fetchResults.set(null);
    try {
      this.fetchResults.set(await this.polling.fetchNow());
    } catch (err) {
      this.fetchError.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.fetching.set(false);
    }
  }
}
