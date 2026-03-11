import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesteRebaseFilhaComponent } from './teste-rebase-filha.component';

describe('TesteRebaseFilhaComponent', () => {
  let component: TesteRebaseFilhaComponent;
  let fixture: ComponentFixture<TesteRebaseFilhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesteRebaseFilhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TesteRebaseFilhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
