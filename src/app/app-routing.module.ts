import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBcrComponent } from './components/create-bcr/create-bcr.component';
import { ViewCurrentBcrComponent } from './components/view-current-bcr/view-current-bcr.component';
import { ErrorComponentComponent } from './components/error-component/error-component.component';

const routes: Routes = [
  { path: '', redirectTo: 'create_bcr', pathMatch: 'full' },      // Redirect root to /create_bcr
  { path: 'create_bcr', component: CreateBcrComponent },          // Create BCR page
  { path: 'current_bcr', component: ViewCurrentBcrComponent },    // View Current BCR page
  { path: '**', component: ErrorComponentComponent }              // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,         // Optional: use `true` if you want # based routing for legacy support
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}