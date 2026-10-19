import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  template: `
    <h1>{{ title() }}</h1>
    <button type="button" (click)="changeTitle()">Change title</button>
  `,
})
export class AdminPageComponent {
  readonly title = signal('Admin');

  changeTitle(): void {
    this.title.update((t) => t += '!');
  }
}
