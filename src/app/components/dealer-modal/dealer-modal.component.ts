import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy  } from '@angular/core';
import { dealerTableModal } from '../../models/table-row-model.model';
import { SharedServicesService } from '../../services/shared-services.service';
import { ApiCallsService } from '../../services/api-calls.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LoaderService } from '../../services/loader.service';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';


declare var bootstrap: any;

@Component({
  selector: 'app-dealer-modal',
  templateUrl: './dealer-modal.component.html',
  styleUrl: './dealer-modal.component.css',
})
export class DealerModalComponent implements OnInit {
  searchText:string = '';
  dealerType:string = '';

  dealerEmpty:boolean = true;
  isDealerLoading = true;

  dealerList: dealerTableModal[] = [];

  displayedColumns: string[] = ['account', 'name', 'city', 'state', 'active'];

  dataSource = new MatTableDataSource<dealerTableModal>(this.dealerList);

  @ViewChild(MatPaginator) paginator!: MatPaginator; 
  @ViewChild(MatSort) sort!: MatSort; 

  private destroy$ = new Subject<void>();

  constructor(
    private apiservices: ApiCallsService,
    private sharedService: SharedServicesService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
    ) {}

  ngOnInit() {
      this.loadData();
  }

  loadData() {

    this.sharedService.dealerType$.pipe(takeUntil(this.destroy$)).subscribe((dealerType) => {
      this.dealerType = dealerType;
    });

    this.sharedService.fromSearchtext$.pipe(takeUntil(this.destroy$)).subscribe((searchtext) => {
      this.searchText = searchtext;
      this.dealerList = [];
      if(this.searchText != '')
      {
        this.isDealerLoading = true;
        this.loaderService.show();
        this.apiservices.getDealerDetails(this.searchText).pipe(takeUntil(this.destroy$)).subscribe({
          next: (data) => {
            if(data['status'] = 200 && data['results']['data'].length > 0)
            {
              const dealerData = data['results']['data'];
              this.dealerList = dealerData.map((item: any): dealerTableModal => ({
                account: +item.account_number,                      // Convert account number to a number
                name: item.name,                                    // Dealer name
                city: item.address.city || 'N/A',                   // City or 'N/A' if null
                state: item.address.state_or_province || 'N/A',     // State or 'N/A' if null
                active: item.account_active ? 'Active' : 'Inactive', // Active status based on boolean,
                orgID: item.id
              }));            
              this.dataSource.data = this.dealerList;
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;

              this.isDealerLoading = false;
              this.dealerEmpty = false;
              this.loaderService.hide();
            }
            else
            {
              this.snackBar.open('No dealers found!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
              this.dataSource.data = this.dealerList;
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              
              this.dealerEmpty = true;
              this.isDealerLoading = false;
              this.loaderService.hide();
            }
          },
          error: (error) => {
            console.error('Error:', error);
            const errorMsg = error?.error?.message || 'An error occurred while fetching dealer list. Please try again later.';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'] // Apply the custom CSS class here
            });
            this.dealerEmpty = true;
            this.isDealerLoading = false;
            this.loaderService.hide();
          }

        });
      }
    });

    this.sharedService.clearComponents$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if(value != null && value == true)
      {
        this.dealerList = [];
        this.dataSource.data = [];
        this.dataSource.paginator = null;
        this.searchText = '';
        this.dealerEmpty = true;
        this.dealerType = '';
      }
    })
  }

  ngAfterViewInit(){
    this.dataSource.sort = this.sort;
  }

  setDealer(dealer)
  {
    if(this.dealerType == "from")
    {
      this.sharedService.updateSelectedFromDealer(dealer);
    }
    else
    {
      this.sharedService.updateSelectedToDealer(dealer);
    }

    const modalElement = document.getElementById('searchmodal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
}
