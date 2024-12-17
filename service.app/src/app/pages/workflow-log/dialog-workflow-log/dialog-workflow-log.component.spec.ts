import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogWorkflowLogComponent } from './dialog-workflow-log.component';

describe('DialogWorkflowLogComponent', () => {
  let component: DialogWorkflowLogComponent;
  let fixture: ComponentFixture<DialogWorkflowLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogWorkflowLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogWorkflowLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
