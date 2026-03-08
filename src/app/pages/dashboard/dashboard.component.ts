import { Component } from '@angular/core';
import { ContainerPrincipalComponent } from "../../components/container-principal/container-principal.component";
import { DashboardCardComponent } from "../../components/dashboard-card/dashboard-card.component";
import { ProximosConfrontosCardComponent } from "../../components/proximos-confrontos-card/proximos-confrontos-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ContainerPrincipalComponent, DashboardCardComponent, ProximosConfrontosCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
