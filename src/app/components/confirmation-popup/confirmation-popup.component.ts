import { Component } from '@angular/core';
import { SharedServicesService } from '../../services/shared-services.service';
declare var bootstrap: any;

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrl: './confirmation-popup.component.css'
})
export class ConfirmationPopupComponent {

  constructor(private sharedServices: SharedServicesService) { }

  confirmSubmit(){
    this.sharedServices.confirmSubmit(true);

    const modalElement = document.getElementById('confirmation-popup');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.hide();
    }
  }
}
