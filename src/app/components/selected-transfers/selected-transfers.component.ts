import { Component, ViewChild, ElementRef } from '@angular/core';
import { ApiCallsService } from '../../services/api-calls.service';
import { SharedServicesService } from '../../services/shared-services.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from '../../services/loader.service';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PdfService } from '../../services/pdf-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var bootstrap:any;

@Component({
  selector: 'app-selected-transfers',
  templateUrl: './selected-transfers.component.html',
  styleUrl: './selected-transfers.component.css'
})
export class SelectedTransfersComponent {
  
  selectedTransfers:any = [];
  transferHeaderDetails: any;
  transferDetails = [];
  transferToBeEdited:any = [] ;
  claim_id:string = '';
  claim_reference:string = '';
  account_id:string = '';
  disableDelete:boolean = true;
  account_type:string = '';
  territory:string = '';
  isDevMode: boolean = false;

  fromDealer:string = '';
  toDealer:string = '';
  transferType:string = '';

  total_sell_price:number = 0;
  total_billed:number = 0;
  total_current:number = 0;
  total_credit:number = 0;
  managerApproved: string = '';
  fromApproved: string = '';
  toApproved: string = '';

  private destroy$ = new Subject<void>();

  isSelectedTransferLoading = false;
  emptyInvoiceTransfer = true;
  selectedRole: string = '';
  selectedFields: string[] = [];
  disableExport: boolean = true;
  isDownloading = false;

  displayedTransferInvoiceColumns: string[] = ['sku','invoice', 'description', 'billed', 'current', 'credit', 'sell_price'];

  transferInvoiceDataSource = new MatTableDataSource<[]>(this.selectedTransfers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('printTemplate') printTemplate!: ElementRef;

  constructor(
    private apiServices: ApiCallsService,
    private sharedServices: SharedServicesService,
    private loaderService: LoaderService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private pdfService: PdfService
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
      this.isDevMode = params['oauth'] === 'isDev';
    })

    this.sharedServices.filter$.subscribe((filterValue) => {
      if (filterValue !== null) {
        // console.log('Filter received in selected-transfers:', filterValue);
        // Reset transfer data
        this.transferInvoiceDataSource.data = null;
        this.emptyInvoiceTransfer = true;
        this.disableDelete = true;
    
        // Clear selected transfers array
        this.selectedTransfers = [];
    
        // Clear reference number if element exists
        const refNumberElement = document.getElementById('ref_number') as HTMLSpanElement | null;
        if (refNumberElement) {
          refNumberElement.textContent = '';
        }
      }
    });    

    this.sharedServices.selectedTransfers$.pipe(takeUntil(this.destroy$)).subscribe((transferElement) =>{
      if(transferElement.length != 0)
      {
        //console.log('VL Response Side Transfer' , transferElement);
        // ✅ Store approval flags
        this.disableExport = this.selectedTransfers.length === 0 || this.claim_reference.includes('Draft');
        this.managerApproved = transferElement['manager_approved'];
        this.fromApproved = transferElement['from_approved'];
        this.toApproved = transferElement['to_approved'];
        this.sharedServices.setValues({
          managerApproved: transferElement['manager_approved'],
          fromApproved: transferElement['from_approved'],
          toApproved: transferElement['to_approved'],
        });

        this.sharedServices.accountType$.pipe(takeUntil(this.destroy$)).subscribe((accountType) => {
          this.account_type = accountType;
        });
        this.claim_id = transferElement['claim_id'];
        this.claim_reference = transferElement['claim_reference'];
        if(this.claim_id != '')
        {
          this.isSelectedTransferLoading = true;
          this.loaderService.show();
          this.apiServices.loadTransfer(this.claim_id).pipe(takeUntil(this.destroy$)).subscribe({
            next: (transferInvoice) => {
              if(transferInvoice != null)
              {
                if(transferInvoice['status'] == 200 && transferInvoice['results']['data'].length != 0)
                {
                  if(transferInvoice['results']['data']['claim_header'].length != 0)
                  {
                    this.transferDetails = transferInvoice['results']['data']['claim_header'];
                    this.fromDealer = transferInvoice['results']['data']['claim_header']['from_name'];
                    this.toDealer = transferInvoice['results']['data']['claim_header']['to_name'];
                    this.territory = transferInvoice['results']['data']['claim_header']['territory'];
                    if(this.fromDealer == "DEMO")
                    {
                      this.transferType = "3";
                    }
                    else if(this.toDealer == "DEMO")
                    {
                      this.transferType = "2";
                    }
                    else
                    {
                      this.transferType = "1";
                    }
                  }

                  if(transferInvoice['results']['data']['claim_items'].length != 0)
                  {
                    this.total_sell_price = 0;
                    this.total_billed = 0;
                    this.total_credit = 0;
                    this.total_current = 0;
                    const selectedTransferData = transferInvoice['results']['data']['claim_items'];
                    this.selectedTransfers = selectedTransferData.map((item) => ({
                      sku: item.sku,
                      description: item.description,
                      invoice: item.invoice,
                      serial: item.serial,
                      billed: item.billed_price,
                      msrp: null,
                      credit: item.credit_price,
                      current: item.current_price,
                      sell_price: item.sell_price,
                      note: item.comment,
                      isManualEntry: item.manual_sku
                    }));

                    this.selectedTransfers.forEach(element => {
                      this.total_sell_price = this.total_sell_price + Number(element.sell_price);
                      this.total_billed = this.total_billed + Number(element.billed);
                      this.total_credit = this.total_credit + Number(element.credit);
                      this.total_current = this.total_current + Number(element.current);
                    });


                    this.transferInvoiceDataSource.data = this.selectedTransfers;
                    this.transferInvoiceDataSource.sort = this.sort;
                    this.transferInvoiceDataSource.paginator = this.paginator;
                    this.emptyInvoiceTransfer = false;
                    this.disableExport = this.selectedTransfers.length === 0 || this.claim_reference.includes('Draft');

                    this.snackBar.open('Invoices loaded!', 'Close', {
                      duration: 3000,
                      horizontalPosition: 'right',
                      verticalPosition: 'top',
                      panelClass: ['green-snackbar'] // Apply the custom CSS class here
                    });
                  }
                  else
                  {
                    this.emptyInvoiceTransfer = true;
                    this.snackBar.open('No Invoices found!', 'Close', {
                      duration: 3000,
                      horizontalPosition: 'right',
                      verticalPosition: 'top',
                      panelClass: ['red-snackbar'] // Apply the custom CSS class here
                    });
                  }

                  const editedTransfer = {
                    organization: {
                      claim_id: transferElement['claim_id'],
                      claim_reference: transferElement['claim_reference'],
                      from_id: transferElement['org_from_id'],
                      to_id: transferElement['org_to_id'],
                      from_name: transferElement['org_from_name'],
                      from_account_number: transferElement['org_from_account_number'],
                      from_city: transferElement['org_from_city'],
                      from_state: transferElement['org_from_state'],
                      to_account_number: transferElement['org_to_account_number'],
                      to_name: transferElement['org_to_name'],
                      to_city: transferElement['org_to_city'],
                      to_state: transferElement['org_to_state']
                    },
                    claim_header: this.transferDetails,
                    claim_items: this.selectedTransfers,
                    account_type: this.account_type,
                    territory: this.territory,
                    claim_status: transferElement['status']
                  }

                  this.transferToBeEdited = editedTransfer;

                  this.transferInvoiceDataSource.data = this.selectedTransfers;
                  this.transferInvoiceDataSource.sort = this.sort;
                  this.transferInvoiceDataSource.paginator = this.paginator;

                  if(transferElement['status'] == 'Draft' || transferElement['status'] == 'Proposed' || transferElement['status'] == 'Pending')
                  {
                    this.disableDelete = false;
                  }
                  else
                  {
                    this.disableDelete = true;
                  }

                  this.isSelectedTransferLoading = false;
                  // this.emptyInvoiceTransfer = false;
                  this.loaderService.hide();
                }
                else
                {
                  this.isSelectedTransferLoading = false;
                  this.emptyInvoiceTransfer = true;
                  this.loaderService.hide();
                }
              }     
            },
            error: (error) => {
              console.error('Error:', error);
              this.snackBar.open('Something went wrong!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
              this.isSelectedTransferLoading = false;
              this.emptyInvoiceTransfer = true;
              this.loaderService.hide();
            }
          })
        }
      }
    });

    this.sharedServices.claimToDelete$.pipe(takeUntil(this.destroy$)).subscribe((claimDelete) => {
      if (claimDelete != '')
      {
        if(this.claim_id == claimDelete)
        {
          this.apiServices.deleteTransfer(this.claim_id).subscribe({
            next: (deleteResponse) => {
              this.loaderService.show();
              if(deleteResponse['status'] == 200 && deleteResponse['results']['status'] == "Success")
              {
                this.selectedTransfers = [];
                this.transferInvoiceDataSource = new MatTableDataSource(this.selectedTransfers);
                this.transferInvoiceDataSource.sort = this.sort;
                this.transferInvoiceDataSource.paginator = this.paginator;
                this.emptyInvoiceTransfer = true;
                this.claim_reference = '';
                this.disableDelete = true;
                this.sharedServices.updateClaimList(this.claim_id);
                this.claim_id = '';
                this.snackBar.open('Claim Deleted Successfully!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['red-snackbar'] // Apply the custom CSS class here
                });
                this.loaderService.hide();

              }
              else
              {
                this.snackBar.open('Something went wrong!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['red-snackbar'] // Apply the custom CSS class here
                });
                this.loaderService.hide();
              }
              const modalElement = document.getElementById('delete-popup');
              if (modalElement) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.hide();
              }
            },
            error: (error) => {
              console.error('Error deleting claim:', error);
              this.snackBar.open('Something went wrong!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
              this.loaderService.hide();
              const modalElement = document.getElementById('delete-popup');
              if (modalElement) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.hide();
              }
            }
          });
          
        }
      }
    });
  }

  ngAfterViewInit() {
    this.transferInvoiceDataSource.sort = this.sort;
    this.transferInvoiceDataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }

  editTransfer()
  {
    if(this.transferToBeEdited.length != 0)
    {
      this.sharedServices.editTransferDetails(this.transferToBeEdited);
      this.sharedServices.storeData(this.transferType,'transferType');
      // ** Add redirect logic without affecting existing functionality **
      if (this.isDevMode && this.account_id) {
        this.router.navigate(['/create_bcr'], {
          queryParams: { aid: this.account_id, oauth: 'isDev' }
        });
      }else{
        this.router.navigate(['/create_bcr'], { queryParams: { aid: this.account_id} });
      }
    }
    else
    {
      this.snackBar.open('Please select a Transfer to edit', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
    }
  }

  printTransfer()
  {
    const printElement = this.printTemplate.nativeElement as HTMLElement;
    
    this.loaderService.show();
    document.body.style.overflow = 'hidden';
    printElement.style.display = 'block';
    // Generate the PDF
    this.pdfService.generatePDF(printElement, 'Invoice Transfer File');

    setTimeout(() => {
      printElement.style.display = 'none';
      this.loaderService.hide();
      document.body.style.overflow = 'auto';
    }, 3000);

  }

  deleteClaim()
  {
    if(this.claim_id != '')
    {
      this.sharedServices.deleteClaim(this.claim_id);
    }
  }

  private roleFieldMap: { [key: string]: string[] } = {
    buyer: ['SKU', 'Invoice', 'Serial', 'Description', 'Sell'],
    seller: ['SKU', 'Invoice', 'Serial', 'Description', 'Credit'],
    husqvarna: ['SKU', 'Invoice', 'Serial', 'Description', 'Billed', 'Current', 'Credit', 'Sell']
  };

  getprintTransfer(): void {
    this.isDownloading = true; // Disable button immediately
    this.selectedFields = this.roleFieldMap[this.selectedRole] || [];
    const printElement = this.printTemplate.nativeElement as HTMLElement;

    //this.loaderService.show();
    document.body.style.overflow = 'hidden';
    printElement.style.display = 'block';

    // 👇 Generate timestamp + role-based filename
    const roleLabel = this.selectedRole || 'All';
    const now = new Date();
    const formattedTimestamp = now.getFullYear().toString() +
      ('0' + (now.getMonth() + 1)).slice(-2) +
      ('0' + now.getDate()).slice(-2) + '_' +
      ('0' + now.getHours()).slice(-2) +
      ('0' + now.getMinutes()).slice(-2) +
      ('0' + now.getSeconds()).slice(-2);
    const fileName = `Transfers_${roleLabel}_Export_${formattedTimestamp}.pdf`;

    setTimeout(() => {
      this.pdfService.generatePDF(printElement, fileName)
        .finally(() => {
          printElement.style.display = 'none';
          //this.loaderService.hide();
          document.body.style.overflow = 'auto';
          this.isDownloading = false; // Enable button after download
        });
    }, 50);
  }

  onRoleChange(event: any): void {
    this.selectedRole = event.target.value;
  }

  exportToCSV(): void {
    const headers = ['SKU', 'Invoice #', 'Serial #', 'Description', 'Billed', 'Current', 'Credit', 'Sell'];
    const csvRows = [headers.join(',')];

    this.selectedTransfers.forEach((item: any) => {
      const row = [
        item.sku,
        item.invoice,
        `"${item.description}"`, // quoted to prevent comma issues
        item.billed ?? 0,
        item.current ?? 0,
        item.credit ?? 0,
        item.sell_price ?? 0
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `TransferData_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

}
