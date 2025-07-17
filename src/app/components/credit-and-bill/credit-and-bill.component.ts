import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ApiCallsService } from '../../services/api-calls.service';
import { TableRowModel,dealerTableModal } from '../../models/table-row-model.model';
import { SharedServicesService } from '../../services/shared-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { LoaderService } from '../../services/loader.service';
import { retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare var bootstrap: any;

@Component({
  selector: 'app-credit-and-bill',
  templateUrl: './credit-and-bill.component.html',
  styleUrl: './credit-and-bill.component.css'
})
export class CreditAndBillComponent implements OnInit, AfterViewInit{

  private destroy$ = new Subject<void>();
  acct_id: number | null = null; // Store aid from URL
  isDevMode: boolean = false;
  bcr_status_url: string = ''; // Change this based on your logic  
  isLocal = environment.local;

  constructor(
    private apiservices: ApiCallsService,
    private sharedService: SharedServicesService,
    private changeDetection: ChangeDetectorRef,
    private route:ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    private loaderService: LoaderService
    ) {}
  // selectedValue:string = '';
  dealerFromValue:string ='No Dealer Selected';
  dealerToValue:string ='No Dealer Selected';
  selectedValue:string = '1';
  fromSearchText:string = '';
  toSearchText:string = '';
  bcr_status:string = '';
  account_id:string = '';
  aid:string = '';
  dealerFromText:string = '';
  dealerToText:string = '';
  accountType: string = '';
  selectedFromTerritory:string = '';
  selectedToTerritory:string = '';

  total_billed:number = 0;
  total_cost:number = 0;
  total_credit:number = 0;

  total_costs;
  search_dealers;

  showErrorFrom:boolean = false;
  showErrorTo:boolean = false;
  toggleInvoice:boolean = false;
  bcr_submitted_status:boolean = false;

  dealerList: dealerTableModal[] = [];
  selectedFromDealer: dealerTableModal[] = [];
  selectedToDealer: dealerTableModal[] = [];
  agentTerritories = [];
  
  @ViewChild('dealerFrom') dealerFrom!: ElementRef;
  @ViewChild('dealerTo') dealerTo!: ElementRef;

  typeChange()
  {
    this.dealerFromText = '';
    this.dealerToText = '';
    this.selectedFromTerritory = '';
    this.selectedToTerritory = '';
    this.clearValues();
  }

  territoryChange()
  {
    if((this.selectedValue == '2' && this.selectedToTerritory != '' && this.dealerFromValue != 'No Dealer Selected' && this.dealerFromValue != '') || (this.selectedValue == '3' && this.selectedFromTerritory != '' && this.dealerToValue != 'No Dealer Selected' && this.dealerToValue != ''))
    {
      this.invoiceToggle(true);
    }
    else
    {
      this.invoiceToggle(false);
    }

    if(this.selectedValue == '2' && this.selectedToTerritory != '')
    {
      this.sharedService.updateToTerritory(this.selectedToTerritory);
    }

    if(this.selectedValue == '3' && this.selectedFromTerritory != '')
    {
      this.sharedService.updateFromTerritory(this.selectedFromTerritory);
    }
  }

  validateFromSearch(dealerFrom: HTMLInputElement)
  {
    if (!dealerFrom.value.trim()) {
      // Show error if input is empty or whitespace
      this.snackBar.open('Enter an account number to proceed with the search.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
    } 
    else 
    {
      // Proceed with search and hide error
      this.showErrorFrom = false;
      this.sharedService.updateDealerType("from");

      const modalElement = document.getElementById('searchmodal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      }

      this.fromSearched(dealerFrom);
      this.changeDetection.detectChanges();
    }
  }

  fromSearched(dealerFrom: any)
  {
    this.fromSearchText = dealerFrom.value;
    this.sharedService.updateDealerSearchText(this.fromSearchText);
    this.sharedService.updateDealerForInvoice(this.fromSearchText);
    this.sharedService.updateTransferType(this.selectedValue);
  }

  validateToSearch(dealerTo: HTMLInputElement)
  {
    if (!dealerTo.value.trim()) {
      // Show error if input is empty or whitespace
      this.snackBar.open('Enter an account number to proceed with the search.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
    } else {
      // Proceed with search and hide error
      this.showErrorTo = false;
      this.sharedService.updateDealerType("to");

      const modalElement = document.getElementById('searchmodal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      }

      this.toSearched(dealerTo);
    }
  }

  toSearched(dealerTo: any)
  {
    this.toSearchText = dealerTo.value;
    this.sharedService.updateDealerSearchText(this.toSearchText);
    this.sharedService.updateTransferType(this.selectedValue);
  }

  

  ngOnInit() {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/current_bcr')) {
      this.bcr_status_url = 'current_bcr';
    } else if (currentUrl.startsWith('/create_bcr')) {
      this.bcr_status_url = 'create_bcr';
    }
    this.initializeAccountData();
    this.sharedService.transferDetailsTriggerObservable$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.loadTransferDetails();
    });
    if(this.isLocal){
      this.loadTransferDetails();
    }
    this.retrieveSharedServiceData();
    this.subscribeToSharedServiceUpdates();
  }
  
  private initializeAccountData(): void {
    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
      this.acct_id = params['aid'] ? Number(params['aid']) : null;
      this.isDevMode = params['oauth'] === 'isDev';
  
      // Ensure aid is assigned after query params are available
      this.aid = this.accountService.getAID();
    });
  }
  
  private loadTransferDetails(): void {
    if (!this.aid) return;
  
    this.loaderService.show();
    this.apiservices.getTransferDetails(this.aid).pipe(
      retry(1), // Retry once before failing
      takeUntil(this.destroy$)
    ).subscribe({
      next: (transferDetails) => {
        // console.log('Response Data:', transferDetails.results);
        this.loaderService.hide();
        if (transferDetails?.status === 200 && transferDetails.results) {
          this.accountType = transferDetails.results?.AgentRole;
          this.agentTerritories = transferDetails.results?.AgentTerritories;
        } else {
          this.handleError('Account not found!');
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.handleError('Could not fetch the account information! Try again later.', err);
      }
    });
  }
  
  private retrieveSharedServiceData(): void {
    this.bcr_submitted_status = this.sharedService.retrieveBCRStatus() || false;
    const initialCosts = this.sharedService.retrieveInitialCosts();
    if (initialCosts) {
      this.total_billed = initialCosts.total_billed;
      this.total_cost = initialCosts.total_cost;
      this.total_credit = initialCosts.total_credit;
    }
    
    const dealerSearch = this.sharedService.retrieveDealerSearch();
    if (dealerSearch) {
      this.dealerFromText = dealerSearch.dealer_from;
      this.dealerToText = dealerSearch.dealer_to;
      this.accountType = dealerSearch.agent_role;
      this.selectedValue = dealerSearch.type;
      this.selectedFromTerritory = dealerSearch.territory_from;
      this.selectedToTerritory = dealerSearch.territory_to;
    }
  }
  
  private subscribeToSharedServiceUpdates(): void {
    this.sharedService.bcr_status$.pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.bcr_status = status;
    });
  
    this.sharedService.selectedFromDealer$.pipe(takeUntil(this.destroy$)).subscribe(dealer => {
      this.updateDealerInfo('from', dealer);
    });
  
    this.sharedService.selectedToDealer$.pipe(takeUntil(this.destroy$)).subscribe(dealer => {
      this.updateDealerInfo('to', dealer);
    });
  
    this.sharedService.costsToBeUpdated$.pipe(takeUntil(this.destroy$)).subscribe(costs => {
      this.updateCosts(costs);
    });
  
    this.sharedService.editedTransfers$.pipe(takeUntil(this.destroy$)).subscribe(editedTransfer => {
      this.processEditedTransfer(editedTransfer);
    });
  
    this.sharedService.bcrSubmitStatus$.pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status !== null) this.bcr_submitted_status = status;
    });
  }
  
  private updateDealerInfo(type: 'from' | 'to', dealer: any): void {
    if (!dealer?.name) return;
  
    const dealerValue = `${dealer.name}-${dealer.city || 'N/A'}`;
    if (type === 'from') {
      this.selectedFromDealer = dealer;
      this.dealerFromValue = dealerValue;
    } else {
      this.selectedToDealer = dealer;
      this.dealerToValue = dealerValue;
    }
  
    this.toggleInvoice = 
      ((this.dealerFromValue !== 'No Dealer Selected' && this.dealerFromValue !== '') || this.selectedFromTerritory !== '') &&
      ((this.dealerToValue !== 'No Dealer Selected' && this.dealerToValue !== '') || this.selectedToTerritory !== '');
  
    this.invoiceToggle(this.toggleInvoice);
  }
  
  private updateCosts(costs: any): void {
    if (!costs || costs.length === 0) return;
    if (costs.type === "multiply") {
      this.total_billed = Number((this.total_billed * costs.billed).toFixed(2));
      this.total_cost = Number((this.total_cost * costs.cost).toFixed(2));
      this.total_credit = Number((this.total_credit * costs.credit).toFixed(2));
    } else {
      const adjustment = costs.type === "add" ? 1 : -1;
      this.total_billed = Number((this.total_billed + adjustment * costs.billed).toFixed(2));
      this.total_cost = Number((this.total_cost + adjustment * costs.cost).toFixed(2));
      this.total_credit = Number((this.total_credit + adjustment * costs.credit).toFixed(2));
    }
  }  
  
  private processEditedTransfer(editedTransfer: any): void {
    if (!editedTransfer || editedTransfer.length === 0) return;
  
    this.accountType = editedTransfer.account_type;
    this.bcr_submitted_status = false;
    if (editedTransfer.claim_status !== 'Draft') this.bcr_submitted_status = true;
  
    if (editedTransfer.organization?.from_id === null) {
      this.selectedValue = "3";
      this.sharedService.updateTransferType(this.selectedValue);
      this.selectedFromTerritory = editedTransfer.territory;
      this.dealerToValue = `${editedTransfer.organization.to_name}-${editedTransfer.organization.to_city}`;
      this.dealerToText = editedTransfer.organization.to_account_number;
    } else if (editedTransfer.organization?.to_id === null) {
      this.selectedValue = "2";
      this.sharedService.updateTransferType(this.selectedValue);
      this.selectedToTerritory = editedTransfer.territory;
      this.dealerFromValue = `${editedTransfer.organization.from_name}-${editedTransfer.organization.from_city}`;
      this.dealerFromText = editedTransfer.organization.from_account_number;
    } else {
      this.selectedValue = "1";
      this.dealerFromValue = `${editedTransfer.organization.from_name}-${editedTransfer.organization.from_city}`;
      this.dealerToValue = `${editedTransfer.organization.to_name}-${editedTransfer.organization.to_city}`;
      this.dealerFromText = editedTransfer.organization.from_account_number;
      this.dealerToText = editedTransfer.organization.to_account_number;
    }
  
    this.total_billed = 0;
    this.total_cost = 0;
    this.total_credit = 0;
    editedTransfer.claim_items.forEach(item => {
      this.total_billed += Number(item.billed);
      this.total_cost += Number(item.current);
      this.total_credit += Number(item.credit);
    });
  
    this.invoiceToggle(true);
  }
  
  private handleError(message: string, err?: any): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['red-snackbar']
    });
    if (err) console.error(err.status === 0 ? 'Network or SSL issue:' : 'API error:', err);
  }  

  ngAfterViewInit() {
    this.sharedService.createButtonClick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.total_costs = this.sharedService.retrieveInitialCosts();
      this.search_dealers = this.sharedService.retrieveDealerSearch();
    });
  }
  
    
  invoiceToggle(toggle)
  {
    this.sharedService.toggleInvoice(toggle);
  }

  viewCurrentBCR() {   
    const total_costs = {
      'total_billed': this.total_billed,
      'total_cost': this.total_cost,
      'total_credit': this.total_credit
    };

    const searchTexts = {
      'dealer_from': this.dealerFromText,
      'dealer_to': this.dealerToText,
      'type': this.selectedValue,
      'agent_role': this.accountType,
      'territory_from': this.selectedFromTerritory,
      'territory_to': this.selectedToTerritory
    };

    this.sharedService.storeData(searchTexts, 'dealers');
    this.sharedService.storeData(total_costs, 'costs');
    this.invoiceToggle(false);
    this.sharedService.clearComponents(null);

    // ** Add redirect logic without affecting existing functionality **
    if (this.isDevMode && this.account_id) {
      this.router.navigate(['/current_bcr'], {
        queryParams: { aid: this.account_id, oauth: 'isDev' }
      });
    }
  }


  clearValues()
  {
    this.dealerFromValue = 'No Dealer Selected';
    this.dealerToValue = 'No Dealer Selected';
    this.fromSearchText = '';
    this.toSearchText = '';
    this.dealerFromText = '';
    this.dealerToText = '';
    this.selectedFromTerritory = '';
    this.selectedToTerritory = '';
    this.total_billed = 0;
    this.total_cost = 0;
    this.total_credit = 0;
    this.invoiceToggle(false);
    this.sharedService.clearComponents(true);
    this.bcr_submitted_status = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }
  
}
