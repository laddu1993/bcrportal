import { AfterViewInit, Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { SharedServicesService } from '../../services/shared-services.service';
import { TableRowModel, selectedInvoices } from '../../models/table-row-model.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { concat, from } from 'rxjs';
import { ApiCallsService } from '../../services/api-calls.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { PdfService } from '../../services/pdf-service.service';
import { LoaderService } from '../../services/loader.service';
import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { environment } from '../../../environments/environment';

declare var bootstrap: any;

@Component({
  selector: 'app-current-bcr',
  templateUrl: './current-bcr.component.html',
  styleUrl: './current-bcr.component.css'
})
export class CurrentBcrComponent implements OnInit, AfterViewInit{

  private destroy$ = new Subject<void>();

  constructor(
    private sharedServices: SharedServicesService,
    private route: ActivatedRoute,
    private apiServices: ApiCallsService,
    private snackBar: MatSnackBar,
    private pdfService: PdfService,
    private renderer: Renderer2,
    private loaderService: LoaderService,
    private accountService: AccountService
  ) { }

  account_id:string = '';
  fromDealerID:string = '';
  toDealerID:string = '';
  dealerFromValue:string = '';
  dealerToValue:string = '';
  claimID:string = '';
  transferType:string = '';
  aid:string = '';
  fromTerritory = '';
  toTerritory = '';
  baseUrl = environment.baseUrl;

  submit_bcr:boolean = false;
  bcr_submitted_status:boolean = false;

  total_billed:number = 0;
  total_cost:number = 0;
  total_credit:number = 0;
  total_sell_amount:number = 0;
  editedIndex:number = null;
  bulkImportEnabled = true;
  bulkFileError: string = '';
  selectedBulkFile: File | null = null;
  importErrors: string[] = [];

  selectedInvoices:selectedInvoices[] = [];
  savedInvoices = [];
  bcr_details = [];
  displayedColumns: string[] = ['sku', 'description', 'invoice', 'serial' ,'billed', 'current', 'credit', 'sell_amount', 'edit', 'remove'];
  transferDetails = [];
  totalCosts = {
    'billed': 0,
    'cost': 0,
    'credit': 0,
    'type': ''
  };

  selectedInvoiceSource = new MatTableDataSource<selectedInvoices>(this.selectedInvoices);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('accordionItem') accordionItem!: ElementRef;
  @ViewChild('printTemplate') printTemplate!: ElementRef;

  ngOnInit() {
    this.aid = this.accountService.getAID();
    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
    });

    if(this.sharedServices.retrieveBCRStatus())
    {
      this.bcr_submitted_status = this.sharedServices.retrieveBCRStatus();
    }

    if(this.sharedServices.retrieveSelectedInvoiceData()){

      if(this.sharedServices.retrieveTransferType()){
        this.transferType = this.sharedServices.retrieveTransferType();
      }

      if(this.sharedServices.retrieveDealerSearch()){
        const search_dealers = this.sharedServices.retrieveDealerSearch();
        this.fromTerritory = search_dealers['territory_from'];
        this.toTerritory = search_dealers['territory_to'];
      }
      
      this.selectedInvoices = this.sharedServices.retrieveSelectedInvoiceData();
      this.defineTableDataSource(this.selectedInvoices);

      const accordion = document.getElementById('accordionItem');

      if(accordion){
        this.renderer.addClass(accordion, 'active');
        // Find the collapse element and add the 'show' class
        const collapseElement = accordion.querySelector(
          '.accordion-collapse'
        );
        this.renderer.addClass(collapseElement, 'show');
        // Set aria-expanded to true
        const buttonElement = accordion.querySelector(
          '.accordion-button'
        );
        if (buttonElement) {
          this.renderer.setAttribute(buttonElement, 'aria-expanded', 'true');
          this.renderer.removeClass(buttonElement, 'collapsed'); // Ensure the button reflects the expanded state
        }
      }
    }

    if(this.sharedServices.retrieveSavedInvoices()){
      this.savedInvoices = this.sharedServices.retrieveSavedInvoices();
      this.calculateCosts(this.savedInvoices);
    }

    if(this.sharedServices.retrieveClaimID()){
      this.claimID = this.sharedServices.retrieveClaimID();
    }

    if(this.sharedServices.retrieveTransferDetails()){
      this.transferDetails = this.sharedServices.retrieveTransferDetails();
    }

    this.sharedServices.selectedFromDealer$.pipe(takeUntil(this.destroy$)).subscribe((dealer) =>
    {
      if(dealer['name'] != undefined)
      {
        this.dealerFromValue = dealer['name']+'-'+dealer['city'];
      }   
    });

    this.sharedServices.selectedToDealer$.pipe(takeUntil(this.destroy$)).subscribe((dealer) =>
    {
      if(dealer['name'] != undefined)
      {
        this.dealerToValue = dealer['name']+'-'+dealer['city'];
      }  
    });
    

    this.sharedServices.selectedInvoice$.pipe(takeUntil(this.destroy$)).subscribe((invoice) => {
      if(invoice != null)
      {
        this.selectedInvoices.push(invoice);
        this.defineTableDataSource(this.selectedInvoices);

        this.renderer.addClass(this.accordionItem.nativeElement, 'active');

        // Find the collapse element and add the 'show' class
        const collapseElement = this.accordionItem.nativeElement.querySelector(
          '.accordion-collapse'
        );
        this.renderer.addClass(collapseElement, 'show');

        // Set aria-expanded to true
        const buttonElement = this.accordionItem.nativeElement.querySelector(
          '.accordion-button'
        );
        if (buttonElement) {
          this.renderer.setAttribute(buttonElement, 'aria-expanded', 'true');
          this.renderer.removeClass(buttonElement, 'collapsed'); // Ensure the button reflects the expanded state
        }

        // const iconPlus = buttonElement.querySelector('.fa-plus');

        // // If the accordion is expanded, ensure it shows the minus icon
        // if (iconPlus) {
        //   // this.renderer.removeClass(iconPlus, 'fa-plus');
        //   this.renderer.addClass(iconPlus, 'fa-minus');
        // } 
      }  
    });

    this.sharedServices.updatedBCR$.pipe(takeUntil(this.destroy$)).subscribe((updatedInvoice) => {
      if(updatedInvoice != null )
      {
        //console.log('updatedInvoice:', updatedInvoice);
        // const index = this.selectedInvoices.findIndex(item => item.invoice == updatedInvoice.invoice &&  item.sku == updatedInvoice.sku);
        if(this.editedIndex != -1 && this.editedIndex != null)
        {
          if(updatedInvoice.isInventory)
          {
            let add = false;
            if(Number(this.selectedInvoices[this.editedIndex].billed) != Number(updatedInvoice.billed))
            {
              this.totalCosts.billed = Number(updatedInvoice.billed) - Number(this.selectedInvoices[this.editedIndex].billed);
              add = true;
            }
            else
            {
              this.totalCosts.billed = 0;
            }
            if(Number(this.selectedInvoices[this.editedIndex].current) != Number(updatedInvoice.current))
            {
              this.totalCosts.cost = Number(updatedInvoice.current) - Number(this.selectedInvoices[this.editedIndex].current);
              add = true;
            }
            else
            {
              this.totalCosts.cost = 0;
            }
            if(Number(this.selectedInvoices[this.editedIndex].credit) != Number(updatedInvoice.credit))
            {
              this.totalCosts.credit = Number(updatedInvoice.credit) - Number(this.selectedInvoices[this.editedIndex].credit);
              add = true;
            }
            else
            {
              this.totalCosts.credit = 0;
            }
            this.totalCosts.type = "add";

            if(add == true)
            {
              this.sharedServices.updateCosts(this.totalCosts);
            }
          }
          
          this.selectedInvoices[this.editedIndex] = updatedInvoice;
          this.defineTableDataSource(this.selectedInvoices);
          this.editedIndex = null;
        }
        this.snackBar.open('Invoice details updated successfully.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['green-snackbar'] // Apply the custom CSS class here
        });
      }
    });

    this.sharedServices.addManualBCR$.pipe(takeUntil(this.destroy$)).subscribe((manualEntry) => {
      if(manualEntry != null)
      {
        if(!(this.selectedInvoices.some((i) => i.sku == manualEntry.sku && i.serial.trim() == manualEntry.serial)) || this.selectedInvoices.length == 0)
        {
          this.selectedInvoices.push(manualEntry);
          this.defineTableDataSource(this.selectedInvoices);

          this.totalCosts.billed = manualEntry.billed;
          this.totalCosts.cost = manualEntry.current;
          this.totalCosts.credit = manualEntry.credit;
          this.totalCosts.type = "add";

          this.sharedServices.updateCosts(this.totalCosts);

          this.snackBar.open('Invoice added successfully.', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['green-snackbar'] // Apply the custom CSS class here
          });
        }
        else
        {
          this.snackBar.open('This SKU & Serial are already included in this transfer.', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['red-snackbar'] // Apply the custom CSS class here
          });
        }
      }
    });

    this.sharedServices.transferType$.pipe(takeUntil(this.destroy$)).subscribe((transferType) => {
      if(transferType != ''){
        this.transferType = transferType;
      }
    });

    this.sharedServices.territoryFrom$.pipe(takeUntil(this.destroy$)).subscribe((territoryFrom) => {
      if(territoryFrom != ''){
        this.fromTerritory = territoryFrom;
      }
    });

    this.sharedServices.territoryTo$.pipe(takeUntil(this.destroy$)).subscribe((territoryTo) => {
      if(territoryTo != ''){
        this.toTerritory = territoryTo;
      }
    });

    this.sharedServices.clearComponents$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if(value != null && value == true){
        this.selectedInvoices = [];
        this.selectedInvoiceSource.data = [];
        this.selectedInvoiceSource.paginator = null;
        this.claimID = '';
        this.transferDetails = [];
        this.savedInvoices = [];
        this.total_billed = 0;
        this.total_cost = 0;
        this.total_credit = 0;
        this.total_sell_amount = 0;
        this.bcr_submitted_status = false;
      }
    });

    this.sharedServices.transfers$.pipe(takeUntil(this.destroy$)).subscribe((transfer) => {
      if(transfer.length != 0) 
      {
        this.transferDetails = transfer;

        if(this.bcr_submitted_status)
        {
          const transfer_details = {
            header: {
              tc: this.transferDetails['tc'],   // Transfer Code
              gc: this.transferDetails['gc'],   // GE Approval Code
              notes: this.transferDetails['notes'],  // Notes
              cid: this.claimID
            }
          }

          this.loaderService.show();
          this.apiServices.update_bcr(transfer_details).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
              if(response['status'] == 200)
              {
                
                this.snackBar.open('Transfer details updated', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['green-snackbar'] // Apply the custom CSS class here
                });
                this.loaderService.hide();
              }
              else
              {
                // Attempt to extract a specific error message from the response, otherwise use a default.
                const errorMsg = response?.message || 'Failed to update transfer details. Please try again later.';
                this.snackBar.open(errorMsg, 'Close', {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top',
                  panelClass: ['red-snackbar'] // Apply the custom CSS class here
                });
                this.loaderService.hide();
              }
            },
            error: (error) => {
              console.error('Error updating order:', error);
              // Check for a detailed error message in the error object.
              const errorMsg = error?.error?.message || 'An error occurred while updating transfer details. Please try again later.';
              this.snackBar.open(errorMsg, 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
              this.loaderService.hide();
            }
          });
        }
        else
        {
          this.snackBar.open('Transfer details updated', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['green-snackbar'] // Apply the custom CSS class here
          });

          if( this.submit_bcr == true)
          {
            this.submitBCR();
            this.submit_bcr = false;
          }
        }
      }
    });

    this.sharedServices.selectedFromDealer$.pipe(takeUntil(this.destroy$)).subscribe((dealerFrom) => {  
      if(dealerFrom != null){
        this.fromDealerID = dealerFrom['orgID'];
      }
    });

    this.sharedServices.selectedToDealer$.pipe(takeUntil(this.destroy$)).subscribe((dealerTo) => {  
      if(dealerTo != null){
        this.toDealerID = dealerTo['orgID'];
      }
    }); 

    this.sharedServices.toggleInvoice$.pipe(takeUntil(this.destroy$)).subscribe((toggle) => {
      if(toggle != null)
      {
        this.sharedServices.storeData(this.selectedInvoices,'selectedInvoices');
        this.sharedServices.storeData(this.transferDetails,'selectedTransferDetails');
        this.sharedServices.storeData(this.savedInvoices,'savedInvoices');
        // this.sharedServices.storeData(this.transferType,'transferType');
        this.sharedServices.storeData(this.claimID,'claimID');
        this.sharedServices.storeData(this.bcr_submitted_status,'bcr_submitted_status')
      }
    });

    this.sharedServices.editedTransfers$.pipe(takeUntil(this.destroy$)).subscribe((editedTransfer) => {
      if(editedTransfer.length != 0)
      {
        //console.log('VL edit Transfer', editedTransfer);
        this.bcr_submitted_status = false;
        if(editedTransfer['claim_status'] != 'Draft'){
          this.bcr_submitted_status = true;
        }
        
        this.selectedInvoices = editedTransfer['claim_items'].map((item: any): selectedInvoices => ({
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
          isInventory: editedTransfer['organization']['from_id'] == null? true: false
        }));
        this.claimID = editedTransfer['organization']['claim_id'];
        this.fromDealerID = (editedTransfer['organization']['from_id'] != null)?editedTransfer['organization']['from_id']:'';
        this.toDealerID = (editedTransfer['organization']['to_id'] != null)?editedTransfer['organization']['to_id']:'';
        this.dealerFromValue = (editedTransfer['organization']['from_name'] != null && editedTransfer['organization']['from_name'] != '')?editedTransfer['organization']['from_name']:'';
        this.dealerToValue = (editedTransfer['organization']['to_name'] != null && editedTransfer['organization']['to_name'] != '')?editedTransfer['organization']['to_name']:'';
        this.savedInvoices = this.selectedInvoices.map(item => ({
          sku: item.sku,                    // SKU
          serial: item.serial,            // Serial Number
          model: item.model,
          invoice: item.invoice,            // Invoice Number
          description: item.description,    // Product Description
          billed: item.billed,        // Billed Price
          current: item.current,      // Current Price
          msrp: item.msrp,          // Credit Price (MSRP)
          credit: item.credit,
          sell_amount: item.sell_amount,     // Sell Price
          isManualEntry: item.isManualEntry,
          isInventory: item.isInventory, // Manual Entry Flag
          note: item.note                // Additional Comments
        }));
        this.calculateCosts(this.savedInvoices);
        this.defineTableDataSource(this.selectedInvoices);

        if(this.fromDealerID == '')
        {
          this.transferType = '3';
          this.fromTerritory = editedTransfer['territory'];
        }
        else if(this.toDealerID == '')
        {
          this.transferType == '2';
          this.toTerritory = editedTransfer['territory'];
        }
        else
        {
          this.transferType == '1';
        }
        
        const { term_code, ge_approval_code, comments } = editedTransfer['claim_header'];

        // Check if all fields are null or empty
        if (!term_code && !ge_approval_code && !comments) {
          this.transferDetails = []; // Empty the array
        } else {
          // If any of the fields have a value, populate the array
          this.transferDetails = [{
            tc: term_code || '', // Default to empty string if null
            gc: ge_approval_code || '',
            notes: comments || ''
          }];
          if(this.transferDetails.length > 0)
          {
            this.transferDetails = this.transferDetails[0];
          }
        }

        const accordion = document.getElementById('accordionItem');

        if(accordion)
        {
          this.renderer.addClass(accordion, 'active');

          // Find the collapse element and add the 'show' class
          const collapseElement = accordion.querySelector(
            '.accordion-collapse'
          );
          this.renderer.addClass(collapseElement, 'show');

          // Set aria-expanded to true
          const buttonElement = accordion.querySelector(
            '.accordion-button'
          );
          if (buttonElement) {
            this.renderer.setAttribute(buttonElement, 'aria-expanded', 'true');
            this.renderer.removeClass(buttonElement, 'collapsed'); // Ensure the button reflects the expanded state
          }
        }
        

        this.sharedServices.updateCosts(this.totalCosts);
      }
    });

    this.sharedServices.clearTransfer$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.transferDetails = [];
    });

    this.sharedServices.confirmBcrSubmit$.pipe(takeUntil(this.destroy$)).subscribe((confirmation) => {
      if(confirmation == true)
      {
        this.loaderService.show();
        const bcr_details = {
          header: {
            orgFromID: this.transferType!='3'?this.fromDealerID:"DEMO",  // From dealer ID
            orgToID: this.transferType!='2'?this.toDealerID:"DEMO",      // To dealer ID
            acct_id: this.aid,      // Account ID
            tc: this.transferDetails['tc'],   // Transfer Code
            gc: this.transferDetails['gc'],   // GE Approval Code
            notes: this.transferDetails['notes'],  // Notes
            status: 'Proposed',            // Status (hardcoded)
            cid: (this.claimID!='')?this.claimID:'',
            territory: this.transferType!='1'?(this.transferType=='2'?this.toTerritory:this.fromTerritory):''
          },
          line_items: this.selectedInvoices.map(item => ({
            sku: item.sku,                    // SKU
            serial: item.serial,              // Serial Number
            invoice: item.invoice,            // Invoice Number
            description: item.description,    // Product Description
            billed_price: item.billed,        // Billed Price
            current_price: item.current,      // Current Price
            credit_price: item.credit,          // Credit Price
            sell_price: item.sell_amount,     // Sell Price
            manual: item.isManualEntry ? '1' : '0', // Manual Entry Flag
            comment: item.note                // Additional Comments
          }))
        }
        this.apiServices.submit_bcr(bcr_details).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response) => {
            if(response['status'] == 200)
            {
              this.savedInvoices = this.selectedInvoices.map(item => ({
                sku: item.sku,                    // SKU
                model: item.model,
                serial: item.serial,              // Serial Number
                invoice: item.invoice,            // Invoice Number
                description: item.description,    // Product Description
                billed: item.billed,        // Billed Price
                current: item.current,      // Current Price
                msrp: item.msrp,          // MSRP
                credit: item.credit,  // Credit Price
                sell_amount: item.sell_amount,     // Sell Price
                isManualEntry: item.isManualEntry,
                isInventory: item.isInventory, // Manual Entry Flag
                note: item.note                // Additional Comments
              }));
              this.calculateCosts(this.savedInvoices);
              if(response['results']['Claim ID'] != '')
              {
                this.claimID = response['results']['Claim ID'];
              }
              this.bcr_submitted_status = true;
              this.sharedServices.updateBcrSubmitStatus(this.bcr_submitted_status);
              this.snackBar.open('Submitted Successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['green-snackbar'] // Apply the custom CSS class here
              });
              this.loaderService.hide();
            }
            else
            {
              const errorMsg = response?.message || 'Failed to Submit details. Please try again later.';
              this.snackBar.open(errorMsg, 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['red-snackbar'] // Apply the custom CSS class here
              });
              this.loaderService.hide();
            }
          },
          error: (error) => {
            console.error('Error updating order:', error);
            const errorMsg = error?.error?.message || 'An error occurred while submitting. Please try again later.';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'] // Apply the custom CSS class here
            });
            this.loaderService.hide();
          }
        });
      }
      
    });

    this.sharedServices.claimToRemove$.pipe(takeUntil(this.destroy$)).subscribe((removeClaim) => {
      if(removeClaim != '' && this.claimID == removeClaim) 
      {
        this.claimID = '';
      }
    });

  }

  ngAfterViewInit() {
    this.selectedInvoiceSource.sort = this.sort;
    this.selectedInvoiceSource.paginator = this.paginator;

    this.sharedServices.createButtonClick$.subscribe(() => {
      this.selectedInvoices = this.sharedServices.retrieveSelectedInvoiceData();
      this.claimID = this.sharedServices.retrieveClaimID();
      this.transferType = this.sharedServices.retrieveTransferType();
      this.savedInvoices = this.sharedServices.retrieveSavedInvoices();
      this.calculateCosts(this.savedInvoices);
      this.defineTableDataSource(this.selectedInvoices);

      this.transferDetails = this.sharedServices.retrieveTransferDetails();
    });
  }

  removeBCR(element) {
    if(element != null)
    {
      this.selectedInvoices = this.selectedInvoices.filter(i => i != element);
      this.defineTableDataSource(this.selectedInvoices);
      //console.log('VL remove', element);
      if (this.selectedInvoices.length === 0) {
        this.totalCosts.billed = 0;
        this.totalCosts.cost = 0;
        this.totalCosts.credit = 0;
        this.totalCosts.type = "multiply";
      } else {
        this.totalCosts.billed = element.billed;
        this.totalCosts.cost = element.current;
        this.totalCosts.credit = element.credit;
        this.totalCosts.type = "subtract";
      }

      this.sharedServices.updateCosts(this.totalCosts);
      
      if(!element.isManualEntry)
      {
        this.sharedServices.removeInvoice(element);
      } 
      
      this.snackBar.open('Invoice removed!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
    }
  }

  editBCR(element) {
    if(element != null && this.bcr_submitted_status == false)
    {
      this.editedIndex = this.selectedInvoices.findIndex((f) => f == element);
      this.sharedServices.openEditModal(element, this.selectedInvoices);
    }  
  }

  addManualEntry()
  {
    this.sharedServices.openEditModal(null, this.selectedInvoices);
  }

  saveBCR()
  {
    if(this.selectedInvoices.length > 0)
    {
      if(!(this.selectedInvoices.some((i) => i.invoice == '' || i.invoice == null || i.serial.trim() == '' || i.serial == null)))
      {
        this.loaderService.show();
        this.bcr_submitted_status = true; // 🔐 Disable button
        const bcr_details = {
          header: {
            orgFromID: this.transferType!='3'?this.fromDealerID:"DEMO",  // From dealer ID
            orgToID: this.transferType!='2'?this.toDealerID:"DEMO",      // To dealer ID
            acct_id: this.aid,      // Account ID
            tc: this.transferDetails['tc'],   // Transfer Code
            gc: this.transferDetails['gc'],   // GE Approval Code
            notes: this.transferDetails['notes'],  // Notes
            status: 'Draft',            // Status (hardcoded)
            cid: (this.claimID!='')?this.claimID:'',
            territory: this.transferType!='1'?(this.transferType=='2'?this.toTerritory:this.fromTerritory):''
          },
          line_items: this.selectedInvoices.map(item => ({
            sku: item.sku,                    // SKU
            serial: item.serial,              // Serial Number
            invoice: item.invoice,            // Invoice Number
            description: item.description,    // Product Description
            billed_price: item.billed,        // Billed Price
            current_price: item.current,      // Current Price
            msrp: item.msrp,                  // MSRP
            credit_price: item.credit,          // Credit Price
            sell_price: item.sell_amount,     // Sell Price
            manual: item.isManualEntry ? '1' : '0', // Manual Entry Flag
            comment: item.note                // Additional Comments
          }))
        }

        this.apiServices.submit_bcr(bcr_details).subscribe({
          next: (response) => {if(response['status'] == 200)
            {
              this.savedInvoices = this.selectedInvoices.map(item => ({
                sku: item.sku,                    // SKU
                model: item.model,
                serial: item.serial,              // Serial Number
                invoice: item.invoice,            // Invoice Number
                description: item.description,    // Product Description
                billed: item.billed,        // Billed Price
                current: item.current,      // Current Price
                msrp: item.msrp,          // MSRP
                credit: item.credit,       // Credit Price
                sell_amount: item.sell_amount,     // Sell Price
                isManualEntry: item.isManualEntry,
                isInventory: item.isInventory, // Manual Entry Flag
                note: item.note                // Additional Comments
              }));
              this.calculateCosts(this.savedInvoices);
              if(response['results']['Claim ID'] != '')
              {
                this.claimID = response['results']['Claim ID'];
              } 
              this.snackBar.open('Saved Successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
                panelClass: ['green-snackbar'] // Apply the custom CSS class here
              });
              this.loaderService.hide();
              this.bcr_submitted_status = false; // ✅ Re-enable button
            }
          },
          error: (error) => {
            console.error('Error updating order:', error);
            const errorMsg = error?.error?.message || 'An error occurred while saving details. Please try again later.';
            this.snackBar.open(errorMsg, 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['red-snackbar'] // Apply the custom CSS class here
            });
            this.loaderService.hide();
            this.bcr_submitted_status = false; // ✅ Re-enable button
          }
        });
      }
      else
      {
        this.snackBar.open('Invoice number or serial number is empty for some records!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
      } 
    }
    else
    {
      this.snackBar.open('Please select invoices!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['red-snackbar'] // Apply the custom CSS class here
      });
      this.loaderService.hide();
    }
    this.loaderService.hide();
  }

  submitBCR()
  {
    this.submit_bcr = true;
    if(this.transferDetails.length != 0)
    {
      if(this.selectedInvoices.length > 0)
      {
        this.submit_bcr = false;
        if(!(this.selectedInvoices.some((i) => i.invoice == '' || i.invoice == null || i.serial.trim() == '' || i.serial == null)))
        {
          const modalElement = document.getElementById('confirmation-popup');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
          }
        }
        else
        {
          this.snackBar.open('Invoice number or serial number is empty for some records!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['red-snackbar'] // Apply the custom CSS class here
          });
        }
      } 
      else
      {
        this.submit_bcr = false;
        this.snackBar.open('Please select invoices!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
      }
    }
    else
    {
      this.sharedServices.updateSubmitBCRStatus(this.submit_bcr);
      // this.snackBar.open('Please add the transfer details before submit!', 'Close', {
      //   duration: 3000,
      //   horizontalPosition: 'right',
      //   verticalPosition: 'top',
      //   panelClass: ['red-snackbar'] // Apply the custom CSS class here
      // });

      const modalElement = document.getElementById('detailsmodal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      }
    }
    
  }
 
  printBCR()
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

  defineTableDataSource(tableDataSource)
  {
    this.selectedInvoiceSource.data = tableDataSource;
    this.selectedInvoiceSource.sort = this.sort;
    this.selectedInvoiceSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }

  transferDetailsClicked()
  {
    this.submit_bcr = false;
    this.sharedServices.updateSubmitBCRStatus(this.submit_bcr);
  }

  calculateCosts(invoicesSaved)
  {
    this.total_billed = 0;
    this.total_cost = 0;
    this.total_credit = 0;
    this.total_sell_amount = 0;
    invoicesSaved.forEach(invoiceElement => {
      this.total_billed = this.total_billed + Number(invoiceElement.billed);
      this.total_credit = this.total_credit + Number(invoiceElement.credit);
      this.total_cost = this.total_cost + Number(invoiceElement.current);
      this.total_sell_amount = this.total_sell_amount + Number(invoiceElement.sell_amount);
    });
  }

  onBulkFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (allowedTypes.includes(file.type)) {
        this.selectedBulkFile = file;
        this.bulkFileError = '';
      } else {
        this.selectedBulkFile = null;
        this.bulkFileError = 'Please upload a valid Excel or CSV file.';
      }
    }
  }

  importBulk(): void {
    if (!this.selectedBulkFile) {
      this.bulkFileError = 'Please select a file to import.';
      return;
    }

    const formData = new FormData();
    formData.append('bulkFile', this.selectedBulkFile);

    this.apiServices.import_bulk(formData).subscribe({
      next: (response) => {
        // Check for backend 'status' value
        if (response.status === 'error') {
          const message = response.message || 'An unknown error occurred during import.';
          this.importErrors = response.errors || [];

          this.snackBar.open(message, 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['red-snackbar']
          });
          return; // Stop processing further
        }
        // Success case
        this.importErrors = []; // clear previous errors
        // Continue with success case
        const invoices: selectedInvoices[] = (response.data || []).map(item => ({
          sku: item.sku || '',
          model: '0',
          description: item.description || '',
          invoice: item.invoice?.toString() || '',
          serial: item.serial || '',
          billed: item.billed ?? 0,
          msrp: item.credit ?? 0,
          current: item.current ?? 0,
          credit: item.credit ?? 0,
          sell_amount: item.sell_amount ?? 0,
          note: 'bulk imported',
          isManualEntry: false,
          isInventory: false
        }));

        this.savedInvoices = invoices;
        this.selectedInvoices = invoices;
        this.selectedInvoiceSource.data = invoices;
        this.selectedInvoiceSource = new MatTableDataSource(invoices);

        const modalElement = document.getElementById('importBulkModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
        }

        // Reset file input
        const inputElement = <HTMLInputElement>document.getElementById('bulkFile');
        if (inputElement) {
          inputElement.value = ''; // Clear file input
        }
        this.selectedBulkFile = null;
        this.bulkFileError = '';

        this.snackBar.open('Bulk Import Updated Successfully.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['green-snackbar']
        });
      },
      error: (error) => {
        console.error('Import failed:', error);
        this.snackBar.open('Failed to import the data.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar']
        });
      }
    });
  }
  
}

