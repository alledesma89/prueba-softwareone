import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';
type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Sets a value in the specified storage type
   */
  public set(key: string, value: unknown, type: StorageType = 'localStorage'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stringValue = JSON.stringify(value);

    switch (type) {
      case 'localStorage':
        localStorage.setItem(key, stringValue);
        break;
      case 'sessionStorage':
        sessionStorage.setItem(key, stringValue);
        break;
      case 'cookie':
        this.setCookie(key, stringValue);
        break;
    }
  }

  /**
   * Gets a value from the specified storage type
   */
  public get<T>(key: string, type: StorageType = 'localStorage'): T | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    let stringValue: string | null = null;

    switch (type) {
      case 'localStorage':
        stringValue = localStorage.getItem(key);
        break;
      case 'sessionStorage':
        stringValue = sessionStorage.getItem(key);
        break;
      case 'cookie':
        stringValue = this.getCookie(key);
        break;
    }

    if (!stringValue) {
      return null;
    }

    try {
      return JSON.parse(stringValue) as T;
    } catch {
      return null;
    }
  }

  /**
   * Removes a value from the specified storage type
   */
  public remove(key: string, type: StorageType = 'localStorage'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    switch (type) {
      case 'localStorage':
        localStorage.removeItem(key);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(key);
        break;
      case 'cookie':
        this.removeCookie(key);
        break;
    }
  }

  /**
   * Clears all data from the specified storage type
   */
  public clear(type: StorageType = 'localStorage'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    switch (type) {
      case 'localStorage':
        localStorage.clear();
        break;
      case 'sessionStorage':
        sessionStorage.clear();
        break;
      case 'cookie':
        this.clearAllCookies();
        break;
    }
  }

  /**
   * Sets the user's theme preference
   */
  public setThemePreference(theme: ThemePreference): void {
    // Store theme preference in a cookie that expires in 1 year
    const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds in a year
    const expirationDate = new Date(Date.now() + oneYear);
    
    document.cookie = `theme=${theme}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
  }

  /**
   * Gets the user's theme preference
   */
  public getThemePreference(): ThemePreference {
    const theme = this.getCookie('theme');
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      return theme as ThemePreference;
    }
    return 'system';
  }

  /**
   * Private method to set a cookie with additional options
   */
  private setCookie(
    name: string,
    value: string,
    days: number = 7,
    path: string = '/',
    sameSite: 'Strict' | 'Lax' | 'None' = 'Strict'
  ): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const cookie = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
      `expires=${expirationDate.toUTCString()}`,
      `path=${path}`,
      `SameSite=${sameSite}`,
    ];

    // Add Secure flag if SameSite is None
    if (sameSite === 'None') {
      cookie.push('Secure');
    }

    document.cookie = cookie.join('; ');
  }

  /**
   * Private method to get a cookie value
   */
  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const cookies = document.cookie.split(';');
    const cookieName = encodeURIComponent(name);

    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === cookieName) {
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  /**
   * Private method to remove a specific cookie
   */
  private removeCookie(name: string, path: string = '/'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  }

  /**
   * Private method to clear all cookies
   */
  private clearAllCookies(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name] = cookie.trim().split('=');
      this.removeCookie(name);
    }
  }
}