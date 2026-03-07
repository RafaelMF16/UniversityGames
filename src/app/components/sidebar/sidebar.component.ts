import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatListModule,
    MatIcon,
    RouterLink,
    RouterLinkActive
],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}
