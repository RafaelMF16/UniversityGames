import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { Membro, MembroPayload } from '../../models/equipe.model';

@Component({
  selector: 'app-linha-membro-equipe',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './linha-membro-equipe.component.html',
  styleUrl: './linha-membro-equipe.component.css'
})
export class LinhaMembroEquipeComponent {
  @Input() membro!: Membro | MembroPayload;
  @Input() podeRemover = false;
  @Output() membroRemovido = new EventEmitter<number | undefined>();
}
