import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinhaMembroEquipeComponent } from './linha-membro-equipe.component';

describe('LinhaMembroEquipeComponent', () => {
  let component: LinhaMembroEquipeComponent;
  let fixture: ComponentFixture<LinhaMembroEquipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinhaMembroEquipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinhaMembroEquipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
