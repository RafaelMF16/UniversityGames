import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { Membro } from '../../models/equipe.model';

@Component({
  selector: 'app-linha-membro-equipe',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './linha-membro-equipe.component.html',
  styleUrl: './linha-membro-equipe.component.css'
})
export class LinhaMembroEquipeComponent {
  @Input() membro!: Membro;
  @Output() membroRemovido = new EventEmitter<number>();
}
