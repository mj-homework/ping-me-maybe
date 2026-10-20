import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Tab bar at the top of every admin page (#34). Tooltips are the native `title`. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Admin">
      <a
        routerLink="/admin/events"
        routerLinkActive="active"
        title="News items ingested from all sources. Fetch now polls the sources."
        >Events</a
      >
      <a
        routerLink="/admin/rules"
        routerLinkActive="active"
        title="Every user's alert rules (read-only)."
        >Rules</a
      >
      <a
        routerLink="/admin/deliveries"
        routerLinkActive="active"
        title="Sent and failed notifications, with the error reason."
        >Deliveries</a
      >
    </nav>
  `,
})
export class AdminNavComponent {}
