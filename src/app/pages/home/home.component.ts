import { Component } from '@angular/core';
import { ContainerComponent } from "../../components/container/container.component";
import { HeaderHomePageComponent } from "../../components/header-home-page/header-home-page.component";
import { ConteudoPrincipalComponent } from "../../components/conteudo-principal/conteudo-principal.component";

@Component({
  selector: 'app-home',
  imports: [ContainerComponent, HeaderHomePageComponent, ConteudoPrincipalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
