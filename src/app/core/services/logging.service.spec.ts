import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoggingService]
    });
    service = TestBed.inject(LoggingService);

    // Spy on console methods before each test
    spyOn(console, 'error');
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'info');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logError', () => {
    it('should log an error to the console and simulate send', (done) => {
      const error = new Error('Test Error');
      const context = { component: 'TestCmp' };

      service.logError(error, context);

      // Check for console.error call
      expect(console.error).toHaveBeenCalledWith('[LoggingService] ERROR', jasmine.any(Object));
      const payload = (console.error as jasmine.Spy).calls.mostRecent().args[1];
      expect(payload.level).toBe('error');
      expect(payload.body.error).toBe(error);
      expect(payload.body.context).toEqual(context);

      // Check for simulated send
      setTimeout(() => {
        expect(console.info).toHaveBeenCalledWith('[LoggingService] simulated send to', jasmine.any(String), 'payload:', payload);
        done();
      }, 250);
    });
  });

  describe('logEvent', () => {
    it('should log an event to the console and simulate send', (done) => {
      const event = 'user_login';
      const data = { userId: 123 };

      service.logEvent(event, data);

      // Check for console.log call
      expect(console.log).toHaveBeenCalledWith('[LoggingService] EVENT', jasmine.any(Object));
      const payload = (console.log as jasmine.Spy).calls.mostRecent().args[1];
      expect(payload.level).toBe('event');
      expect(payload.body.event).toBe(event);
      expect(payload.body.data).toEqual(data);

      // Check for simulated send
      setTimeout(() => {
        expect(console.info).toHaveBeenCalledWith('[LoggingService] simulated send to', jasmine.any(String), 'payload:', payload);
        done();
      }, 250);
    });
  });

  describe('logWarning', () => {
    it('should log a warning to the console and simulate send', (done) => {
      const message = 'This is a warning';
      const context = { details: 'Additional details' };

      service.logWarning(message, context);

      // Check for console.warn call
      expect(console.warn).toHaveBeenCalledWith('[LoggingService] WARNING', jasmine.any(Object));
      const payload = (console.warn as jasmine.Spy).calls.mostRecent().args[1];
      expect(payload.level).toBe('warn');
      expect(payload.body.message).toBe(message);
      expect(payload.body.context).toEqual(context);

      // Check for simulated send
      setTimeout(() => {
        expect(console.info).toHaveBeenCalledWith('[LoggingService] simulated send to', jasmine.any(String), 'payload:', payload);
        done();
      }, 250);
    });
  });
});
