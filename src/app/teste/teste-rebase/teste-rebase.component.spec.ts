import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesteRebaseComponent } from './teste-rebase.component';

describe('TesteRebaseComponent', () => {
  let component: TesteRebaseComponent;
  let fixture: ComponentFixture<TesteRebaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesteRebaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TesteRebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
