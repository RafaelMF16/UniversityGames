import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-proximos-confrontos-card',
  imports: [
    MatCardModule
  ],
  templateUrl: './proximos-confrontos-card.component.html',
  styleUrl: './proximos-confrontos-card.component.css'
})
export class ProximosConfrontosCardComponent {
  confrontos = [
    { id: 1, equipe1: 'Dragões FC', equipe2: 'Águias United', data: '09/03/2026', hora: '19:00', local: 'Ginásio Central' },
    { id: 2, equipe1: 'Leões SC', equipe2: 'Falcões FC', data: '11/03/2026', hora: '20:00', local: 'Quadra Norte' },
    { id: 3, equipe1: 'Dragões FC', equipe2: 'Leões SC', data: '14/03/2026', hora: '18:30', local: 'Ginásio Central' }
  ];
}
