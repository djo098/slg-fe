import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualBalanceDetailComponent } from './virtual-balance-detail.component';

describe('VirtualBalanceDetailComponent', () => {
  let component: VirtualBalanceDetailComponent;
  let fixture: ComponentFixture<VirtualBalanceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VirtualBalanceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualBalanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
