import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Equipe } from '../../models/equipe.model';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-filtros-card',
  standalone: true,
  imports: [
    FormsModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './filtros-card.component.html',
  styleUrl: './filtros-card.component.css'
})
export class FiltrosCardComponent {
  @Input() equipes: Equipe[] = [];
    @Output() filtroDataChange = new EventEmitter<string>();
    @Output() filtroEquipeChange = new EventEmitter<string>();

    filtroData = '';
    filtroEquipe = '';

    onDataChange() { this.filtroDataChange.emit(this.filtroData); }
    onEquipeChange() { this.filtroEquipeChange.emit(this.filtroEquipe); }
}
