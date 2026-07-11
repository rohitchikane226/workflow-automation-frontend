import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../header/header.component.ts/header.component.ts';
import { FooterComponent } from '../../footer/footer.js';
import { IntegrationsSectionComponent } from '../../integrations-section/integrations-section.js';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    IntegrationsSectionComponent
  ],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.scss']
})
export class HomePageComponent {

  constructor(private router: Router) {}

  getStarted() {
    this.router.navigate(['/dashboard']);
  }

}