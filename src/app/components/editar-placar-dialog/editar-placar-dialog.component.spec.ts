import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlacarDialogComponent } from './editar-placar-dialog.component';

describe('EditarPlacarDialogComponent', () => {
  let component: EditarPlacarDialogComponent;
  let fixture: ComponentFixture<EditarPlacarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPlacarDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPlacarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
