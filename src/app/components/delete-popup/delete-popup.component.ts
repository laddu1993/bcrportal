import { Component } from '@angular/core';
import { SharedServicesService } from '../../services/shared-services.service';
import { ApiCallsService } from '../../services/api-calls.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrl: './delete-popup.component.css'
})
export class DeletePopupComponent {

  claim_id:string = '';
  confirm:boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private sharedService: SharedServicesService,
    private apiServices: ApiCallsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.sharedService.claimToBeDeleted$.pipe(takeUntil(this.destroy$)).subscribe((claimId) => {
      if(claimId != '')
      {
        this.claim_id = claimId;
      }
    });
  }

  confirmDelete()
  {
    if(this.claim_id != '')
    {
      this.confirm = true;
      this.sharedService.confirmClaimDelete( this.claim_id, this.confirm);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Notify all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }
}
