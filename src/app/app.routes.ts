import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EquipesComponent } from './pages/equipes/equipes.component';
import { EsporteDetalheComponent } from './pages/esporte-detalhe/esporte-detalhe.component';
import { ConfrontosComponent } from './pages/confrontos/confrontos.component';
import { ConfrontoDetalheComponent } from './pages/confronto-detalhe/confronto-detalhe.component';
import { PaginaPrincipalComponent } from './pages/pagina-principal/pagina-principal.component';
import { LoginComponent } from './pages/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { adminGuard } from './guards/admin.guard';
import { appAccessGuard } from './guards/app-access.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: '',
        component: PaginaPrincipalComponent,
        canActivate: [appAccessGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'equipes',
                redirectTo: 'esportes',
                pathMatch: 'full'
            },
            {
                path: 'esportes',
                component: EquipesComponent
            },
            {
                path: 'esportes/:id',
                component: EsporteDetalheComponent
            },
            {
                path: 'confrontos',
                component: ConfrontosComponent
            },
            {
                path: 'confrontos/:id',
                component: ConfrontoDetalheComponent
            },
            {
                path: 'usuarios',
                component: UsuariosComponent,
                canActivate: [adminGuard]
            }
        ]
    }
];
