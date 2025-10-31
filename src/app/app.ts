import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, inject, afterNextRender } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('TaskManagementApp');
  private platformId = inject(PLATFORM_ID);
  isOnline = signal(isPlatformBrowser(this.platformId) ? navigator.onLine : true);
  // Dark mode signal (persisted in localStorage)
  darkMode = signal<boolean>(false);


  constructor(private router: Router) {

    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        // online/offline listeners
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);

        // Initialize dark mode from localStorage
        try {
          const stored = localStorage.getItem('darkMode');
          const isDark = stored === 'true';
          this.darkMode.set(isDark);
          if (isDark) {
            document.body.classList.add('dark-theme');
          } else {
            document.body.classList.remove('dark-theme');
          }
        } catch (e) {
          // ignore localStorage errors
        }
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

  /** Toggle dark mode and persist the preference */
  toggleDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.darkMode.update(v => {
      const next = !v;
      try {
        if (next) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('darkMode', String(next));
      } catch (e) {
        // swallow
      }
      return next;
    });
  }


}
