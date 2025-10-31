import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent, MatProgressSpinnerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render mat-spinner with default values', () => {
    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
    expect(spinner.componentInstance.diameter).toBe(40);
    expect(spinner.componentInstance.strokeWidth).toBe(4);
    expect(spinner.componentInstance.color).toBe('primary');
    expect(spinner.componentInstance.mode).toBe('indeterminate');
  });

  it('should apply overlay class when overlay input is true', () => {
    component.overlay = true;
    fixture.detectChanges();
    
    const container = fixture.debugElement.query(By.css('.spinner-container'));
    expect(container.classes['overlay']).toBeTruthy();
  });

  it('should display message when provided', () => {
    const testMessage = 'Loading data...';
    component.message = testMessage;
    fixture.detectChanges();
    
    const messageElement = fixture.debugElement.query(By.css('.spinner-message'));
    expect(messageElement.nativeElement.textContent).toContain(testMessage);
  });

  it('should not display message when not provided', () => {
    const messageElement = fixture.debugElement.query(By.css('.spinner-message'));
    expect(messageElement).toBeFalsy();
  });

  it('should update spinner properties when inputs change', () => {
    component.diameter = 60;
    component.strokeWidth = 6;
    component.color = 'accent';
    component.mode = 'determinate';
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner.componentInstance.diameter).toBe(60);
    expect(spinner.componentInstance.strokeWidth).toBe(6);
    expect(spinner.componentInstance.color).toBe('accent');
    expect(spinner.componentInstance.mode).toBe('determinate');
  });
});