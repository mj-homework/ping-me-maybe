import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Delivery } from '../../core/models/delivery';
import { DeliveriesService } from '../../core/services/deliveries';

const MAX_DELIVERIES = 50;

@Component({
  selector: 'app-admin-deliveries-page',
  imports: [DatePipe],
  template: `
    <h1>Deliveries</h1>
    @if (error(); as message) {
      <p role="alert">Could not load deliveries: {{ message }}</p>
    } @else if (loading()) {
      <p>Loading…</p>
    } @else {
      <p>Newest {{ deliveries().length }} deliveries (max {{ maxDeliveries }}), by created time.</p>
      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Status</th>
            <th>Rule</th>
            <th>Event</th>
            <th>Channel</th>
            <th>Sent at</th>
            <th>Error</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (delivery of deliveries(); track delivery.id) {
            <tr>
              <td>{{ delivery.createdAt | date: 'yyyy-MM-dd HH:mm:ss' }}</td>
              <td>{{ delivery.status }}</td>
              <td>{{ delivery.ruleName }}</td>
              <td>
                <a [href]="delivery.eventUrl" target="_blank" rel="noopener noreferrer">{{
                  delivery.eventTitle
                }}</a>
              </td>
              <td>{{ delivery.channel }}</td>
              <td>{{ delivery.sentAt | date: 'yyyy-MM-dd HH:mm:ss' }}</td>
              <td>
                @if (delivery.status === 'failed') {
                  {{ delivery.error }}
                }
              </td>
              <td>
                @if (delivery.status === 'failed') {
                  <button type="button" disabled title="Coming later (C2)">Retry</button>
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="8">
                No deliveries yet. They appear when a new event matches an active rule.
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class AdminDeliveriesPageComponent {
  protected readonly maxDeliveries = MAX_DELIVERIES;
  protected readonly deliveries = signal<Delivery[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    const unsubscribe = inject(DeliveriesService).watchLatest(
      MAX_DELIVERIES,
      (deliveries) => {
        this.deliveries.set(deliveries);
        this.loading.set(false);
      },
      (err) => this.error.set(err.message),
    );
    inject(DestroyRef).onDestroy(unsubscribe);
  }
}
