import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [
    MatSidenavModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
],
  templateUrl: './pagina-principal.component.html',
  styleUrl: './pagina-principal.component.css'
})
export class PaginaPrincipalComponent {

}
