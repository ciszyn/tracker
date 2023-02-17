import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { PendingChangesGuard } from './guards/can-deactivate';

const routes: Routes = [
  { path: '', component: AppComponent, canDeactivate: [PendingChangesGuard], canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
