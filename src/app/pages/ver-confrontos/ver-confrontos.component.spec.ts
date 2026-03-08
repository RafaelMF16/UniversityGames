import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerConfrontosComponent } from './ver-confrontos.component';

describe('VerConfrontosComponent', () => {
  let component: VerConfrontosComponent;
  let fixture: ComponentFixture<VerConfrontosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerConfrontosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerConfrontosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
