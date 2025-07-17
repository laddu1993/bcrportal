import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallsService } from '../../services/api-calls.service';
import { transferListModel } from '../../models/table-row-model.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from '../../services/loader.service';
import { SharedServicesService } from '../../services/shared-services.service';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-list-transfers',
  templateUrl: './list-transfers.component.html',
  styleUrl: './list-transfers.component.css'
})
export class ListTransfersComponent implements AfterViewInit{

  account_id:string = '';
  filterCriteria:string = '';
  selectedFilter:string = 'open';
  aid:string = '';
  accountType:string = '';

  isTransferLoading = false;
  emptyTransfer = true;

  current_transfers: transferListModel[] = [];
  filtered_transfers: transferListModel[] = [];
  displayedTransferColumns: string[] = ['reference','from', 'to', 'created', 'status', 'husqvarna', 'from_boolean', 'to_boolean'];

  transferDataSource = new MatTableDataSource<transferListModel>(this.current_transfers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private apiServices: ApiCallsService,
    private loaderService: LoaderService,
    private sharedServices: SharedServicesService,
    private snackBar: MatSnackBar,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.aid = this.accountService.getAID();

    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
    });

    this.transferDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'reference':
          return item.claim_reference;
        case 'from':
          return item.org_from_account_number;
        case 'to':
          return item.org_to_account_number;
        case 'created':
          return new Date(item.created_date).getTime();
        case 'husqvarna':
          return item.manager_approved ? 1 : 0;
        case 'from_boolean':
          return item.from_approved ? 1 : 0;
        case 'to_boolean':
          return item.to_approved ? 1 : 0;
        default:
          return item[property];
      }
    };

    this.isTransferLoading = true;
    this.loaderService.show();
    this.apiServices.getTransferDetails(this.aid).pipe(takeUntil(this.destroy$)).subscribe({
      next: (transferDetails) => {
        if(transferDetails['status'] == 200 && transferDetails['results']['data'].length > 0)
        {
          this.accountType = transferDetails['results']['AgentRole'];
          const transferData = transferDetails['results']['data'];
          this.current_transfers = transferData.map((item: any): transferListModel => ({
            claim_id: item.claim_id,             
            claim_reference: item.reference,                           
            org_from_id: item.org_from_id,           
            org_from_account_number: item.org_from_account_number,  
            org_from_name: item.org_from_name,
            org_from_city: item.org_from_city,
            org_from_state: item.org_from_state,
            org_to_id: item.org_to_id,
            org_to_account_number: item.org_to_account_number,
            org_to_name: item.org_to_name,
            org_to_city: item.org_to_city,
            org_to_state: item.org_to_state,
            created_date: item.created_date,
            status: item.status,
            incident_status: item.incident_status,
            manager_approved: item.manager_approved?'Yes':'No',
            from_approved: item.transfer_from_approved?'Yes':'No',
            to_approved: item.transfer_to_approved?'Yes':'No',
            territory: item.territory
          }));

          this.isTransferLoading = false;
          this.emptyTransfer = false;
          this.loaderService.hide();

          this.filterTransfers();
        }
        else
        {
          this.loaderService.hide();
          this.snackBar.open('No Claims found!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['red-snackbar'] // Apply the custom CSS class here
          });
          console.log('Empty results');
        }
      },
      error: (err) => {
        this.snackBar.open('Something went wrong!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
        if (err.status === 0) {
          console.error('Network or SSL issue:', err.message);
        } else {
          console.error('API error:', err);
        }
        this.loaderService.hide();
      },
    });

    this.sharedServices.claimToRemove$.pipe(takeUntil(this.destroy$)).subscribe((removeClaim) => {
      if(removeClaim != '') 
      {
        this.current_transfers = this.current_transfers.filter((item) => item.claim_id != Number(removeClaim));
        this.filterTransfers();
      }
    });
  }

  ngAfterViewInit() {
    this.transferDataSource.sort = this.sort;
    this.transferDataSource.paginator = this.paginator;
  }

  filterChanged(event)
  {
    this.selectedFilter = event.target.value;
    this.filterTransfers();
    // Call transferSelected with an empty transferElement to reset
    this.sharedServices.setFilter(this.selectedFilter); // share the value
  }

  transferSelected(transferElement,event)
  {
    const table = document.getElementById('list-transfer-table');
    //console.log('VL Transfers', transferElement);
    if (table) 
    {
      const rows = table.getElementsByTagName('tr');

      Array.from(rows).forEach(row => {
        row.classList.remove('selected-row');
      });
    }
    this.sharedServices.passSelectedTransfer(transferElement, this.accountType);
    const element = event.target as HTMLInputElement;
    element.parentElement.classList.add('selected-row');
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }


  filterTransfers() {
    let filtered = this.current_transfers;
  
    switch (this.selectedFilter) {
      case 'completed':
        filtered = filtered.filter(item => item.incident_status === 'Solved');
        break;
  
      case 'open':
        filtered = filtered.filter(item =>
          item.status === 'Draft' || item.incident_status === 'Waiting on Approval'
        );
        break;
  
      case 'approved':
        filtered = filtered.filter(item =>
          item.status === 'Approved' ||
          item.incident_status === 'Follow-up' ||
          item.incident_status === 'In process'
        );
        break;
  
      default:
        // No filtering
        filtered = filtered.map(item => {
          if (item.incident_status === 'Waiting on Approval') {
            return { ...item, status: 'Draft' };
          }
          return item;
        });
        break;
    }
  
    this.filtered_transfers = filtered;
    this.transferDataSource.data = filtered;
    this.transferDataSource.sort = this.sort;
    this.transferDataSource.paginator = this.paginator;
    this.emptyTransfer = filtered.length === 0;
  }
  
}
