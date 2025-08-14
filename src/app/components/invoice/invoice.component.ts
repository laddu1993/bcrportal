import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ApiCallsService } from '../../services/api-calls.service';
import { SharedServicesService } from '../../services/shared-services.service';
import { TableRowModel, selectedInvoices } from '../../models/table-row-model.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from '../../services/loader.service';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { subscribe } from 'diagnostics_channel';
import { Subject, pipe } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit, AfterViewInit{

  dealerNum:string = '';
  previousDealer:string = '';
  invoiceSearchValue:string = '';
  transferType:string = '';
  fromTerritory:string = '';
  toTerritory:string = '';
  emptyMessage:string = 'Please search for an invoice to continue';

  editedIndex:number = null;

  isLoading = false;
  emptyResult = true;
  errorMessage: string | null = null;
  bcr_submitted_status:boolean = false;

  invoiceList:TableRowModel[] = [];
  filteredInvoices:TableRowModel[] = [];
  invoiceSeleced:selectedInvoices[] = [];
  displayedColumns: string[] = ['select','sku', 'model', 'description', 'invoice', 'serial', 'billed', 'msrp', 'current'];
  transferDetails = [];
  totalCosts = {
    'billed': 0,
    'cost': 0,
    'credit': 0,
    'type': ''
  };

  dataSource = new MatTableDataSource<TableRowModel>(this.filteredInvoices);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('skuSearch') skuSearch!: ElementRef;
  @ViewChild('modelSearch') modelSearch!: ElementRef;
  @ViewChild('invoiceSearch') invoiceSearch!: ElementRef;
  @ViewChild('serialSearch') serialSearch!: ElementRef;
  @ViewChild('ageSearch') ageSearch!: ElementRef;

  private destroy$ = new Subject<void>();

  constructor(
      private apiServices: ApiCallsService,
      private sharedService: SharedServicesService,
      private loaderService: LoaderService,
      private snackBar: MatSnackBar,
      private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
      this.dataSource.data = this.filteredInvoices;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      

      // if(this.sharedService.retrieveDisplayedColumns())
      // {
      //   this.displayedColumns = this.sharedService.retrieveDisplayedColumns();
      // }

      if(this.sharedService.retrieveBCRStatus())
      {
        this.bcr_submitted_status = this.sharedService.retrieveBCRStatus();
      }

      if(this.sharedService.retrieveSearchedInvoiceData())
      {
        this.filteredInvoices = this.sharedService.retrieveSearchedInvoiceData();

        if(this.sharedService.retrieveSearchedSelectedInvoiceData())
        {
          this.invoiceSeleced = this.sharedService.retrieveSearchedSelectedInvoiceData();
        }

        if(this.sharedService.retrieveDealerSearch())
        {
          const search_dealers = this.sharedService.retrieveDealerSearch();
          this.fromTerritory = search_dealers['territory_from'];
          this.toTerritory = search_dealers['territory_to'];
        }

        if(this.sharedService.retrieveTransferType())
        {
          this.transferType = this.sharedService.retrieveTransferType();
        }

        if(this.transferType == "3")
        {
          this.displayedColumns = ['select','sku', 'model', 'description', 'msrp', 'current'];
          this.emptyMessage = 'Please search for an inventory to continue';
        }
        else
        {
          this.displayedColumns = ['select','sku', 'model', 'description', 'invoice', 'serial', 'billed', 'msrp', 'current'];
          this.emptyMessage = 'Please search for an invoice to continue';
        }
        this.dataSource.data = this.filteredInvoices;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.emptyResult = this.filteredInvoices.length == 0;
      }

      this.sharedService.updatedBCR$.pipe(takeUntil(this.destroy$)).subscribe((elementUpdated) => {
        if(elementUpdated != null)
        {
          if(this.editedIndex != -1 && this.editedIndex != null)
          {
            this.invoiceSeleced[this.editedIndex] = elementUpdated;
            this.editedIndex = null;
          }
        }
      })

      this.sharedService.transferType$.pipe(takeUntil(this.destroy$)).subscribe((transferType) => {
        if(transferType != '')
        {
          this.transferType = transferType;
          if(transferType == '3')
          {
            this.emptyMessage = 'Please search for an inventory to continue';
          }
          else
          {
            this.emptyMessage = 'Please search for an invoice to continue';
          }
        }
      });

      this.sharedService.territoryFrom$.pipe(takeUntil(this.destroy$)).subscribe((territoryFrom) => {
        if(territoryFrom != '')
        {
          this.fromTerritory = territoryFrom;
        }
      });

      this.sharedService.territoryTo$.pipe(takeUntil(this.destroy$)).subscribe((territoryTo) => {
        if(territoryTo != '')
        {
          this.toTerritory = territoryTo;
        }
      });

      this.sharedService.dealerForInvoice$.pipe(takeUntil(this.destroy$)).subscribe((dealer) => {
        this.dealerNum = dealer;   
      });

      this.sharedService.removedInvoice$.pipe(takeUntil(this.destroy$)).subscribe((invoice) => {
        if(invoice != null) {
          this.invoiceSeleced = this.invoiceSeleced.filter(item => item !== invoice);
        }
      });

      this.sharedService.openEditModal$.pipe(takeUntil(this.destroy$)).subscribe((editedInvoice) => {
        if(editedInvoice != null)
        {
          this.editedIndex = this.invoiceSeleced.findIndex((j) => j ==editedInvoice);
        }
        
      });

      this.sharedService.clearComponents$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        if(value != null && value == true)
        {
          this.skuSearch.nativeElement.value = '';
          this.ageSearch.nativeElement.value = '';
          this.invoiceSearch.nativeElement.value = '';
          this.serialSearch.nativeElement.value = '';
          this.ageSearch.nativeElement.value = '1';
          this.dealerNum = '';
          this.previousDealer = '';
          this.invoiceSearchValue = '';
          this.fromTerritory = '';
          this.toTerritory = '';
          this.emptyResult = true;
          this.invoiceList = [];
          this.filteredInvoices = [];
          this.invoiceSeleced = [];
          this.totalCosts['billed'] = 0;
          this.totalCosts['cost'] = 0;
          this.totalCosts['credit'] = 0;
          this.totalCosts['type'] = '';
          this.bcr_submitted_status = false;
        }
      });

      this.sharedService.toggleInvoice$.pipe(takeUntil(this.destroy$)).subscribe((toggle) => {
        if(toggle != null)
        {
          this.sharedService.storeData(this.filteredInvoices,'searchedInvoices');
          this.sharedService.storeData(this.invoiceSeleced,'searchedSelectedInvoices');
          this.sharedService.storeData(this.transferType,'transferType');
          this.sharedService.storeData(this.displayedColumns,'displayedColumns');
        }
      });

      this.sharedService.editedTransfers$.pipe(takeUntil(this.destroy$)).subscribe((editedTransfer) => {
        if(editedTransfer.length != 0)
        {
          if(editedTransfer['organization']['from_id'] == null)
          {
            this.transferType = "3";
            this.displayedColumns = ['select','sku', 'model', 'description', 'msrp', 'current'];
            this.emptyMessage = 'Please search for an inventory to continue';
          }
          else if(editedTransfer['organization']['to_id'] == null)
          {
            this.transferType = "2";
            this.emptyMessage = 'Please search for an invoice to continue';
          }
          else
          {
            this.transferType = "1";
            this.emptyMessage = 'Please search for an invoice to continue';
          }

          this.bcr_submitted_status = false;
          if(editedTransfer['claim_status'] != 'Draft'){
            this.bcr_submitted_status = true;
          }

          this.invoiceSeleced = editedTransfer['claim_items'].map((item: any): selectedInvoices => ({
            sku: item.sku,
            model: item.model,                          
            description: item.description,           
            invoice: item.invoice,  
            serial: item.serial,
            billed: item.billed,
            msrp: item.msrp,
            current: item.current,
            credit: item.credit,
            sell_amount: item.sell_price,
            note: item.note,
            isManualEntry: item.isManualEntry,
            isInventory: false
          }));
          this.emptyResult = true;
          this.dealerNum = editedTransfer['organization']['from_account_number'];
        }
      });

      this.sharedService.bcrSubmitStatus$.pipe(takeUntil(this.destroy$)).subscribe((bcr_submit_status) => {
        if(bcr_submit_status != null)
        {
          this.bcr_submitted_status = bcr_submit_status;
        }
      });

      // this.sharedService.editedTransfers$.pipe(takeUntil(this.destroy$)).subscribe((editedTransfer) => {
      //   if(editedTransfer.length != 0)
      //   {
      //     this.dealerNum = editedTransfer['organization']['from_account_number'];
      //   }
      // });
    }

    ngAfterViewInit() {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.sharedService.createButtonClick$.subscribe(() => {
        this.filteredInvoices = this.sharedService.retrieveSearchedInvoiceData();
        this.transferType = this.sharedService.retrieveTransferType();
        this.displayedColumns = this.sharedService.retrieveDisplayedColumns();

        this.dataSource.data = this.filteredInvoices;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    }

  invoiceSearched(skuSearch: HTMLInputElement, modelSearch: HTMLInputElement,invoiceSearch: HTMLInputElement, serialSearch: HTMLInputElement, ageSearch: HTMLSelectElement)
  {
    // if (
    //   !skuSearch.value.trim() &&
    //   !modelSearch.value.trim() &&
    //   !invoiceSearch.value.trim() &&
    //   !serialSearch.value.trim()
    // ) {
    //   this.snackBar.open('Please fill at least one field: SKU, Model, Invoice, or Serial.', 'Close', {
    //     duration: 3000,
    //     horizontalPosition: 'right',
    //     verticalPosition: 'top',
    //     panelClass: ['red-snackbar'], // Custom CSS class
    //   });
    //   return;
    // }
    this.emptyMessage = 'There are no matching records...';
    if(this.transferType == '3')
    {
      this.displayedColumns = ['select','sku', 'model', 'description', 'msrp', 'current'];
      this.isLoading = true;
      this.loaderService.show();
      if(this.fromTerritory != '')
      {
        this.apiServices.getInventoryDetails(this.fromTerritory).pipe(takeUntil(this.destroy$)).subscribe({
          next: (inventory) => {
            if(inventory['status'] = 'success')
            {
              if(inventory['results'].length != 0)
              {
                const invoiceData = inventory['results'];
                this.invoiceList = invoiceData.map((item: any): TableRowModel => ({
                  sku: item.sku,             
                  model: item.model,                           
                  description: item.description,           
                  invoice: '',  
                  serial: '',
                  billed: null,
                  msrp: item.msrp,
                  current: item.current,
                  credit: null,
                  sell_amount: null,
                  note: '',
                  isManualEntry: false,
                  isInventory: true
                }));
  
                if(skuSearch.value != '' && modelSearch.value != '')
                {
                  this.filteredInvoices = this.invoiceList.filter((filter_item)=> filter_item.sku == skuSearch.value && filter_item.model.trim() == modelSearch.value);
                }
                else if(skuSearch.value != '' && modelSearch.value == '')
                {
                  this.filteredInvoices = this.invoiceList.filter((filter_item)=> filter_item.sku == skuSearch.value);
                }
                else if(skuSearch.value == '' && modelSearch.value != '')
                {
                  this.filteredInvoices = this.invoiceList.filter((filter_item)=> filter_item.model.trim() == modelSearch.value);
                }
                else
                {
                  this.filteredInvoices = this.invoiceList;
                }
  
                this.isLoading = false;
                this.emptyResult = this.filteredInvoices.length == 0;
                this.loaderService.hide();
        
                this.dataSource.data = this.filteredInvoices;
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
              }
              else
              {
                this.emptyResult = true;
                this.isLoading = false;
                this.loaderService.hide();
                this.snackBar.open('No Inventory found!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['red-snackbar'] // Apply the custom CSS class here
                });
              }
              
      
              // this.filterInvoices(invoiceSearch.value);
            }
            else
            {
              this.emptyResult = true;
              this.isLoading = false;
              this.loaderService.hide();
              this.snackBar.open('No Inventory found!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
            }
          },
          error: (error) => {
            const errorMsg = error?.error?.message || 'An error occurred while fetching inventory. Please try again later.';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'] // Apply the custom CSS class here
            });
            this.emptyResult = true;
            this.isLoading = false;
            this.loaderService.hide();
            if (error.status === 0) {
              console.error('Network or SSL issue:', error.message);
            } else {
              console.error('API error:', error);
            }
          }
        });
      }
      else
      {
        this.snackBar.open('Please choose a valid territory!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
      }
    }
    else
    {
      this.displayedColumns= ['select','sku', 'model', 'description', 'invoice', 'serial', 'billed', 'msrp', 'current'];
      this.previousDealer = this.dealerNum;
      if(this.dealerNum != '')
      {
        this.isLoading = true;
        this.loaderService.show();
        this.apiServices.getInvoiceList(this.dealerNum,skuSearch.value,modelSearch.value,invoiceSearch.value,serialSearch.value,ageSearch.value).subscribe({
          next: (invoice) => {
            if(invoice['status'] = 'success')
            {
              if(invoice['results'].length != 0)
              {
                const invoiceData = invoice['results'];
                this.invoiceList = invoiceData.map((item: any): TableRowModel => ({
                  sku: item.sku,             
                  model: item.model,                           
                  description: item.description,           
                  invoice: item.invoiceNumber,  
                  serial: item.serialNumber,
                  billed: item.billed,
                  msrp: item.msrp,
                  current: item.current,
                  credit: item.billed,
                  sell_amount: item.current,
                  note: '',
                  isManualEntry: false,
                  isInventory: false
                }));
        
                this.filteredInvoices = this.invoiceList;
                this.isLoading = false;
                this.emptyResult = false;
                this.loaderService.hide();
        
        
                this.dataSource.data = this.filteredInvoices;
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
              }
              else
              {
                this.emptyResult = true;
                this.isLoading = false;
                this.loaderService.hide();
                this.snackBar.open('No Invoices found!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['red-snackbar'] // Apply the custom CSS class here
                });
              }
              
      
              // this.filterInvoices(invoiceSearch.value);
            }
            else
            {
              this.emptyResult = true;
              this.isLoading = false;
              this.loaderService.hide();
              this.snackBar.open('No Invoices found!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
            }
          },
          error: (error) => {
            const errorMsg = error?.error?.message || 'An error occurred while fetching invoice listing. Please try again later.';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'] // Apply the custom CSS class here
            });
            this.emptyResult = true;
            this.isLoading = false;
            this.loaderService.hide();
            if (error.status === 0) {
              console.error('Network or SSL issue:', error.message);
            } else {
              console.error('API error:', error);
            }
          }
        });
      }
      else
      {
        this.snackBar.open("You must select a 'From' dealer before searching invoices", 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
      }
    }
    
  }


  checkboxClicked(item: TableRowModel, event: Event){
    if(!(this.invoiceSeleced.some((i) => (item.serial.trim() !='')?(i.sku == item.sku && i.serial == item.serial):false)))
    {
      // let checkedItem = item;
      // checkedItem.msrp = checkedItem.isInventory?null:checkedItem.msrp;
      this.invoiceSeleced.push(item);
      this.sharedService.updateSelectedInvoiceList(item);

      this.totalCosts.billed = item.billed;
      this.totalCosts.cost = item.current;
      this.totalCosts.credit = item.credit;
      this.totalCosts.type = "add";

      this.sharedService.updateCosts(this.totalCosts);
    }
    else
    {
      (event.target as HTMLInputElement).checked = false;
      this.snackBar.open('This SKU & Serial are already included in this transfer.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }
}
