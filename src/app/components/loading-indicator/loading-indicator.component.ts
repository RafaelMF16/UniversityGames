import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.css'
})
export class LoadingIndicatorComponent {
  @Input() label = 'Carregando...';
  @Input() inline = false;
  @Input() small = false;
}
