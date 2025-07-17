import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatSortModule } from '@angular/material/sort';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreditAndBillComponent } from './components/credit-and-bill/credit-and-bill.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { CurrentBcrComponent } from './components/current-bcr/current-bcr.component';
import { DealerModalComponent } from './components/dealer-modal/dealer-modal.component';
import { EditModalComponent } from './components/edit-modal/edit-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CreateBcrComponent } from './components/create-bcr/create-bcr.component';
import { ViewCurrentBcrComponent } from './components/view-current-bcr/view-current-bcr.component';
import { MatTableModule } from '@angular/material/table';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { ListTransfersComponent } from './components/list-transfers/list-transfers.component';
import { SelectedTransfersComponent } from './components/selected-transfers/selected-transfers.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DeletePopupComponent } from './components/delete-popup/delete-popup.component';
import { ConfirmationPopupComponent } from './components/confirmation-popup/confirmation-popup.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ErrorComponentComponent } from './components/error-component/error-component.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    CreditAndBillComponent,
    InvoiceComponent,
    CurrentBcrComponent,
    DealerModalComponent,
    EditModalComponent,
    CreateBcrComponent,
    ViewCurrentBcrComponent,
    ErrorComponentComponent,
    SkeletonLoaderComponent,
    DetailsModalComponent,
    ListTransfersComponent,
    SelectedTransfersComponent,
    DeletePopupComponent,
    ConfirmationPopupComponent,
    ProgressBarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatSortModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }