import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, inject, afterNextRender } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('TaskManagementApp');
  private platformId = inject(PLATFORM_ID);
  isOnline = signal(isPlatformBrowser(this.platformId) ? navigator.onLine : true);


  constructor(private router: Router) {

    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
      });
    }
  }

  ngOnInit(): void {
    this.updateOnlineStatus();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('online', this.updateOnlineStatus);
      window.removeEventListener('offline', this.updateOnlineStatus);
    }
  }

  private updateOnlineStatus = (): void => {
    this.isOnline.set(isPlatformBrowser(this.platformId) ? navigator.onLine : true);
  };


}
