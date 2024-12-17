import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAuditLogComponent } from './dialog-audit-log.component';

describe('DialogAuditLogComponent', () => {
  let component: DialogAuditLogComponent;
  let fixture: ComponentFixture<DialogAuditLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAuditLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAuditLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
