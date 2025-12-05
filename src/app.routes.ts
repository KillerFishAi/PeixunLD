import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { HomeComponent } from './components/home.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
