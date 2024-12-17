import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogVirtualLogisticCotractsComponent } from './dialog-virtual-logistic-cotracts.component';

describe('DialogVirtualLogisticCotractsComponent', () => {
  let component: DialogVirtualLogisticCotractsComponent;
  let fixture: ComponentFixture<DialogVirtualLogisticCotractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogVirtualLogisticCotractsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogVirtualLogisticCotractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
