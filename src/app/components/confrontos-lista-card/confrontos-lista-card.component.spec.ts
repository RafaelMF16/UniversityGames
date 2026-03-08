import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfrontosListaCardComponent } from './confrontos-lista-card.component';

describe('ConfrontosListaCardComponent', () => {
  let component: ConfrontosListaCardComponent;
  let fixture: ComponentFixture<ConfrontosListaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfrontosListaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfrontosListaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
