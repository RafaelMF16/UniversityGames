import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent
],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {
  private readonly authState = inject(AuthStateService);

  constructor() {
    void this.authState.ensureInitialized();
  }
}
