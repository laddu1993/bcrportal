import { Component } from '@angular/core';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { SharedServicesService } from '../../services/shared-services.service';
import { share } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var bootstrap: any;

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css'
})
export class DetailsModalComponent {

  detailsForm:FormGroup;

  transferDetails = [];

  submit_bcr:boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private sharedServices: SharedServicesService,
    private formBuilder: FormBuilder
  ) 
  {
    this.detailsForm = this.formBuilder.group({
      tc: ['', [Validators.required, Validators.maxLength(15)]],
      gc: ['', [Validators.required, Validators.maxLength(15)]],
      notes: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  addTransferDetails()
  {
    if(this.detailsForm.valid)
    {
      this.transferDetails = this.detailsForm.value;
      this.sharedServices.saveTransferDetails(this.transferDetails);

      const modalElement = document.getElementById('detailsmodal');
      if (modalElement) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.hide();
      }
    }
    else
    {
      console.log("error")
      this.detailsForm.markAllAsTouched();
    }
  }

  ngOnInit()
  {
    if(this.sharedServices.retrieveTransferDetails())
    {
      this.transferDetails = this.sharedServices.retrieveTransferDetails();
      this.detailsForm.patchValue(this.transferDetails);
    }

    this.sharedServices.clearComponents$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if(value != null && value == true)
      {
        this.detailsForm.reset();
        this.transferDetails = [];
      }
    });

    this.sharedServices.submitBCRStatus$.pipe(takeUntil(this.destroy$)).subscribe((bcrStatus) => {
      console.log("in");
      if(bcrStatus != null)
      {
        console.log(bcrStatus)
        this.submit_bcr = bcrStatus;
        console.log(this.submit_bcr);
      }
    })
  }

  ngAfterViewInit()
  {
    this.transferDetails = this.sharedServices.retrieveTransferDetails();
    this.detailsForm.patchValue(this.transferDetails);

    this.sharedServices.editedTransfers$.pipe(takeUntil(this.destroy$)).subscribe((editedTransfer) => {
      if (editedTransfer && Object.keys(editedTransfer).length !== 0) {
        // Clear the form and transferDetails
        this.detailsForm.reset();
        this.transferDetails = [];
    
        // Prepare the updated transfer details
        const editedTransferDetails = {
          tc: editedTransfer['claim_header']['term_code'] || '',
          gc: editedTransfer['claim_header']['ge_approval_code'] || '',
          notes: editedTransfer['claim_header']['comments'] || ''
        };
    
        // Update the form and transferDetails
        this.detailsForm.patchValue(editedTransferDetails);
        this.transferDetails['tc'] = editedTransferDetails['tc'];
        this.transferDetails['gc'] = editedTransferDetails['gc'];
        this.transferDetails['notes'] = editedTransferDetails['notes'];
      }
    });
  }

  clearData()
  {
    this.detailsForm.reset();
    this.transferDetails = [];
    this.sharedServices.clearTransferDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }
}
