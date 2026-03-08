import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfrontoFormCardComponent } from './confronto-form-card.component';

describe('ConfrontoFormCardComponent', () => {
  let component: ConfrontoFormCardComponent;
  let fixture: ComponentFixture<ConfrontoFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfrontoFormCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfrontoFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
