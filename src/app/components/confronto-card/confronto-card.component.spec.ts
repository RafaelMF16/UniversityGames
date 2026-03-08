import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfrontoCardComponent } from './confronto-card.component';

describe('ConfrontoCardComponent', () => {
  let component: ConfrontoCardComponent;
  let fixture: ComponentFixture<ConfrontoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfrontoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfrontoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
