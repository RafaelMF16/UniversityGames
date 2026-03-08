import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeCardComponent } from './equipe-card.component';

describe('EquipeCardComponent', () => {
  let component: EquipeCardComponent;
  let fixture: ComponentFixture<EquipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
