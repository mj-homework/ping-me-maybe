import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EventListItem } from '../../core/models/event';
import { EventsService } from '../../core/services/events';

const MAX_EVENTS = 50;

@Component({
  selector: 'app-admin-events-page',
  imports: [DatePipe],
  template: `
    <h1>Events</h1>
    @if (error(); as message) {
      <p role="alert">Could not load events: {{ message }}</p>
    } @else if (loading()) {
      <p>Loading…</p>
    } @else {
      <p>Newest {{ events().length }} events (max {{ maxEvents }}), by ingestion time.</p>
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
              <td>{{ event.sourceId }}</td>
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
                No events yet. Run <code>npm run poll:replay</code> in functions/.
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class AdminEventsPageComponent {
  protected readonly maxEvents = MAX_EVENTS;
  protected readonly events = signal<EventListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

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
}
