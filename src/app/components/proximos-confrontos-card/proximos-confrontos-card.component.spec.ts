import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximosConfrontosCardComponent } from './proximos-confrontos-card.component';

describe('ProximosConfrontosCardComponent', () => {
  let component: ProximosConfrontosCardComponent;
  let fixture: ComponentFixture<ProximosConfrontosCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosConfrontosCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximosConfrontosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
