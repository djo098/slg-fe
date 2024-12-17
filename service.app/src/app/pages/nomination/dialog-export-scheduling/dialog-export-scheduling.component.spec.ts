import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogExportSchedulingComponent } from './dialog-export-scheduling.component';

describe('DialogExportSchedulingComponent', () => {
  let component: DialogExportSchedulingComponent;
  let fixture: ComponentFixture<DialogExportSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogExportSchedulingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogExportSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
