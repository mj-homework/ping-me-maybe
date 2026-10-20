import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminNavComponent } from './admin-nav';

@Component({
  selector: 'app-admin-page',
  imports: [AdminNavComponent, RouterLink],
  template: `
    <app-admin-nav />
    <h1>Admin</h1>
    <ul>
      <li><a routerLink="events">Events</a> – newest ingested events and the Fetch now button</li>
      <li><a routerLink="rules">Rules</a> – all users' alert rules</li>
      <li><a routerLink="deliveries">Deliveries</a> – notification log with status and error</li>
    </ul>
  `,
})
export class AdminPageComponent {}
