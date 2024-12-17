import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogVirtualBalanceComponent } from './dialog-virtual-balance.component';

describe('DialogVirtualBalanceComponent', () => {
  let component: DialogVirtualBalanceComponent;
  let fixture: ComponentFixture<DialogVirtualBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogVirtualBalanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogVirtualBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
