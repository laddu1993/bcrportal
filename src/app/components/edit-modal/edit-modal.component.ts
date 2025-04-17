import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TableRowModel, selectedInvoices } from '../../models/table-row-model.model';
import { SharedServicesService } from '../../services/shared-services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validateSellAmount } from '../../validators/sell_amount_validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var bootstrap:any;

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css'
})
export class EditModalComponent implements OnInit{

  currentElementEdited: selectedInvoices = null;
  newBCRElement: selectedInvoices = null;

  selectedInvoiceList = null;
  
  validSellAmount:boolean = true;
  manualEntry:boolean = true;

  @ViewChild('sellAmountInput') sellAmountInput!: ElementRef;

  addForm:FormGroup;
  editForm:FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
      private sharedServices: SharedServicesService,
      private formBuilder: FormBuilder,
      private snackBar: MatSnackBar
    ) 
    {
      this.editForm = this.formBuilder.group({
        sku: [''],
        invoice: ['', Validators.required],
        description: [''],
        billed: ['', Validators.required],
        current: ['', Validators.required],
        credit: ['', Validators.required],
        sell_amount: ['', [Validators.required, Validators.pattern('^[0-9,.]*$')]],
        serial: ['', [Validators.required]],
        note: [''],
      });

      this.addForm = this.formBuilder.group({
        sku: ['', Validators.required],
        invoice: ['', Validators.required],
        description: ['', Validators.maxLength(50)],
        billed: ['', [Validators.required, Validators.pattern('^[0-9,.]*$')]],
        current: ['', [Validators.required, Validators.pattern('^[0-9,.]*$')]],
        credit: ['', [Validators.required, Validators.pattern('^[0-9,.]*$')]],
        sell_amount: ['', [Validators.required,Validators.pattern('^[0-9,.]*$')]],
        serial: ['', Validators.required],
        note: [''],
      }
      // { validators: validateSellAmount() }
      );
     }

  ngOnInit() {
    this.sharedServices.openEditModal$.pipe(takeUntil(this.destroy$)).subscribe((editedInvoice) => {
      this.currentElementEdited = editedInvoice;
      if (this.currentElementEdited) {
        this.manualEntry = false;
        this.editForm.patchValue(this.currentElementEdited);
      }
      else
      {
        this.manualEntry = true;
      }
      this.sharedServices.selectedInvoiceList$.subscribe((selectedList) => {
        this.selectedInvoiceList = selectedList;
      })
      
    })

    this.sharedServices.clearComponents$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if(value != null && value == true)
      {
        this.addForm.reset();
        this.editForm.reset();
        this.currentElementEdited = null;
        this.newBCRElement = null;
      }
    })
  }

  updateBCR() {
    this.editForm.markAllAsTouched();

    if(this.editForm.valid)
    {
      // if(Number(this.editForm.value.sell_amount) < Number(this.currentElementEdited.current))
      // {
      //   this.validSellAmount = false;
      // }
      // else
      // {
        const index = this.selectedInvoiceList.findIndex(item => item == this.currentElementEdited);
        const matchingIndex = this.selectedInvoiceList.findIndex((i) => 
          this.editForm.value.serial !== '' 
            ? i.sku === this.editForm.value.sku && i.serial.trim() === this.editForm.value.serial 
            : false
        );

        // if(!(this.selectedInvoiceList.some((i) => (this.editForm.value.serial != '') ?(i.sku == this.editForm.value.sku && i.serial.trim() == this.editForm.value.serial):false)))
        if(matchingIndex == index || matchingIndex == -1)
        {
          this.validSellAmount = true;

          const elementEdited = {
            sku: this.currentElementEdited.sku,
            model: this.currentElementEdited.model,
            description: this.currentElementEdited.description,
            invoice: this.currentElementEdited.invoice,
            serial: this.currentElementEdited.serial,
            billed: this.currentElementEdited.billed,
            msrp: this.currentElementEdited.msrp,
            credit: this.currentElementEdited.credit,
            current: this.currentElementEdited.current,
            sell_amount: this.currentElementEdited.sell_amount,
            note: this.currentElementEdited.note,
            isManualEntry: this.currentElementEdited.isManualEntry,
            isInventory: this.currentElementEdited.isInventory
          }

          elementEdited.sell_amount = this.editForm.value.sell_amount;
          elementEdited.serial = this.editForm.value.serial;
          elementEdited.note = this.editForm.value.note;
          elementEdited.billed = this.editForm.value.billed;
          elementEdited.invoice = this.editForm.value.invoice;
          elementEdited.credit = this.editForm.value.credit;

          this.sharedServices.updateBCR(elementEdited);
          this.editForm.reset();

          const modalElement = document.getElementById('editmanualentymodal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.hide();
          }
        }
        else
        {
          this.snackBar.open('This SKU & Serial combination already exists.', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['red-snackbar'] // Apply the custom CSS class here
          });
        }
      // }  
    }
  }

  addBCREntry()
  {
    this.addForm.markAllAsTouched();

    if(this.addForm.valid)
    {
      if(!(this.selectedInvoiceList.some((i) => (this.addForm.value.serial != '') ?(i.sku == this.addForm.value.sku && i.serial.trim() == this.addForm.value.serial):false)))
      {
        this.newBCRElement = {
          sku: this.addForm.get('sku')?.value,
          model: this.addForm.get('model')?.value,
          description: this.addForm.get('description')?.value,
          invoice: this.addForm.get('invoice')?.value,
          serial: this.addForm.get('serial')?.value,
          billed: this.addForm.get('billed')?.value,
          credit: this.addForm.get('credit')?.value,
          msrp: null,
          current: this.addForm.get('current')?.value,
          sell_amount: this.addForm.get('sell_amount')?.value,
          note: this.addForm.get('note')?.value,
          isManualEntry: true,
          isInventory: false
          // Add other properties here
        } as selectedInvoices;
        
        this.sharedServices.addManualBCR(this.newBCRElement);

        this.addForm.reset()
        const modalElement = document.getElementById('editmanualentymodal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
          modalInstance.hide();
        }
      }
      else
      {
        this.snackBar.open('This SKU & Serial combination already exists.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['red-snackbar'] // Apply the custom CSS class here
        });
      }  
    }
    else
    {
      this.addForm.markAllAsTouched();
    }
  }

  resetForm()
  {
    this.addForm.reset();
  }


  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }

  // resetEditForm()
  // {
  //   this.editForm.reset();
  // }

}
