import { Component } from '@angular/core';
import { PaginaPrincipalComponent } from "./pages/pagina-principal/pagina-principal.component";

@Component({
  selector: 'app-root',
  imports: [
    PaginaPrincipalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent {
  title = 'UniversityGames';
}
