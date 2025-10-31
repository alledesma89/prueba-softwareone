import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AlertComponent, AlertType } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent] // Import the standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message', () => {
    const testMessage = 'This is a test alert.';
    component.message = testMessage;
    fixture.detectChanges();

    const messageElement = fixture.debugElement.query(By.css('.message'));
    expect(messageElement.nativeElement.textContent).toContain(testMessage);
  });

  it('should apply the correct class based on type', () => {
    const alertType: AlertType = 'success';
    component.type = alertType;
    component.message = 'Success!';
    fixture.detectChanges();

    const alertDiv = fixture.debugElement.query(By.css('.alert'));
    expect(alertDiv.nativeElement.classList).toContain('success');
  });

  it('should emit close event on button click', () => {
    spyOn(component.close, 'emit');
    component.message = 'Closable alert';
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css('button'));
    closeButton.triggerEventHandler('click', null);

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should render the correct icon for each type', () => {
    const iconMap: { [key in AlertType]: string } = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    for (const type of Object.keys(iconMap) as AlertType[]) {
      component.type = type;
      component.message = 'Icon test';
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe(iconMap[type]);
    }
  });
});
