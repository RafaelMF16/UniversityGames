import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarEquipeCardComponent } from './cadastrar-equipe-card.component';

describe('CadastrarEquipeCardComponent', () => {
  let component: CadastrarEquipeCardComponent;
  let fixture: ComponentFixture<CadastrarEquipeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarEquipeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarEquipeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
