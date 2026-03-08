import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EquipesComponent } from './pages/equipes/equipes.component';
import { ConfrontosComponent } from './pages/confrontos/confrontos.component';
import { VerConfrontosComponent } from './pages/ver-confrontos/ver-confrontos.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: "dashboard",
        pathMatch: 'full'
    },
    {
        path: "dashboard",
        component: DashboardComponent
    },
    {
        path: "equipes",
        component: EquipesComponent
    },
    {
        path: "confrontos",
        component: ConfrontosComponent
    },
    {
        path: "ver-confrontos",
        component: VerConfrontosComponent
    }
];