import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(StorageService);
  });

  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage operations', () => {
    it('should set and get item from localStorage', () => {
      const testData = { test: 'data' };
      service.set('testKey', testData, 'localStorage');
      const retrieved = service.get<typeof testData>('testKey', 'localStorage');
      expect(retrieved).toEqual(testData);
    });

    it('should remove item from localStorage', () => {
      service.set('testKey', 'value', 'localStorage');
      service.remove('testKey', 'localStorage');
      const retrieved = service.get('testKey', 'localStorage');
      expect(retrieved).toBeNull();
    });
  });

  describe('sessionStorage operations', () => {
    it('should set and get item from sessionStorage', () => {
      const testData = { test: 'data' };
      service.set('testKey', testData, 'sessionStorage');
      const retrieved = service.get<typeof testData>('testKey', 'sessionStorage');
      expect(retrieved).toEqual(testData);
    });

    it('should remove item from sessionStorage', () => {
      service.set('testKey', 'value', 'sessionStorage');
      service.remove('testKey', 'sessionStorage');
      const retrieved = service.get('testKey', 'sessionStorage');
      expect(retrieved).toBeNull();
    });
  });

  describe('cookie operations', () => {
    it('should set and get item from cookies', () => {
      const testData = { test: 'data' };
      service.set('testKey', testData, 'cookie');
      const retrieved = service.get<typeof testData>('testKey', 'cookie');
      expect(retrieved).toEqual(testData);
    });

    it('should remove cookie', () => {
      service.set('testKey', 'value', 'cookie');
      service.remove('testKey', 'cookie');
      const retrieved = service.get('testKey', 'cookie');
      expect(retrieved).toBeNull();
    });
  });

  describe('theme preference', () => {
    it('should set and get theme preference', () => {
      service.setThemePreference('dark');
      const theme = service.getThemePreference();
      expect(theme).toBe('dark');
    });

    it('should return system as default theme preference', () => {
      const theme = service.getThemePreference();
      expect(theme).toBe('system');
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON when getting data', () => {
      // Manually set invalid JSON in localStorage
      localStorage.setItem('invalidJson', 'invalid{json');
      const retrieved = service.get('invalidJson', 'localStorage');
      expect(retrieved).toBeNull();
    });
  });
});