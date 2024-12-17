import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  styleUrls: ['./app-layout.scss'],
  template: `
    <nb-layout>
      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>


    </nb-layout>
  `,
})
export class AppLayoutComponent {}
