import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuditLogStructuredComponent } from './dialog-audit-log-structured.component';

describe('DialogAuditLogStructuredComponent', () => {
  let component: DialogAuditLogStructuredComponent;
  let fixture: ComponentFixture<DialogAuditLogStructuredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAuditLogStructuredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAuditLogStructuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
