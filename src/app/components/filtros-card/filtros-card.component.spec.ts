import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosCardComponent } from './filtros-card.component';

describe('FiltrosCardComponent', () => {
  let component: FiltrosCardComponent;
  let fixture: ComponentFixture<FiltrosCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
