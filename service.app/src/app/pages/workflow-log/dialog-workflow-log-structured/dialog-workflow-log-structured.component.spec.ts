import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWorkflowLogStructuredComponent } from './dialog-workflow-log-structured.component';

describe('DialogWorkflowLogStructuredComponent', () => {
  let component: DialogWorkflowLogStructuredComponent;
  let fixture: ComponentFixture<DialogWorkflowLogStructuredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogWorkflowLogStructuredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWorkflowLogStructuredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
