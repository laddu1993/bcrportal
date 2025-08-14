import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedServicesService } from '../../services/shared-services.service';
import { ApiCallsService } from '../../services/api-calls.service';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-create-bcr',
  templateUrl: './create-bcr.component.html',
  styleUrls: ['./create-bcr.component.css'] // Fixed `styleUrl` to `styleUrls` (correct Angular property)
})
export class CreateBcrComponent implements OnInit, OnDestroy {
  // Constants for better maintainability
  private readonly BCR_STATUS = 'create_bcr';

  // Component state
  typeSelected = false;
  fromDealerExist = false;
  showInvoice = false;
  isLocal = environment.local;

  // Subscription management
  private toggleInvoiceSubscription: Subscription | undefined;

  constructor(
    private sharedServices: SharedServicesService,
    private apiServices: ApiCallsService
  ) {}

  ngOnInit(): void {
    if (!this.isLocal) {
      this.login(); // Safe to run in browser-only environment
    }

    // Set initial BCR status
    this.sharedServices.updateBCRStatus(this.BCR_STATUS);
    
    // Subscribe to invoice toggle with proper cleanup
    this.toggleInvoiceSubscription = this.sharedServices.toggleInvoice$.subscribe({
      next: (toggle: boolean) => {
        this.showInvoice = toggle;
      },
      error: (err: any) => {
        console.error('Error in toggleInvoice subscription:', err);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.toggleInvoiceSubscription) {
      this.toggleInvoiceSubscription.unsubscribe();
    }
  }

  private login(): void {
    this.apiServices.login().subscribe({
      next: (res: LoginResponse) => {
        if (res?.token) {
          localStorage.setItem('loginToken', res.token);
          // ✅ Trigger event after successful login
          this.sharedServices.triggerLoadTransferDetails();
        } else {
          console.warn('Login failed: No token received');
          this.handleLoginError('No token received');
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.handleLoginError(err.message || 'Login failed');
      }
    });
  }

  private handleLoginError(message: string): void {
    // TODO: Implement user-friendly error handling (e.g., show toast notification)
    // For now, just log it
    console.error(`Login error: ${message}`);
  }
}