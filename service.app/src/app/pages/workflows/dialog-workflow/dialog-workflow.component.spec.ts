import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWorkflowComponent } from './dialog-workflow.component';

describe('DialogWorkflowComponent', () => {
  let component: DialogWorkflowComponent;
  let fixture: ComponentFixture<DialogWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
