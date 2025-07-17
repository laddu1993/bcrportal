import { Component } from '@angular/core';
import { SharedServicesService } from '../../services/shared-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallsService } from '../../services/api-calls.service';
import { AccountService } from '../../services/account.service';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-view-current-bcr',
  templateUrl: './view-current-bcr.component.html',
  styleUrl: './view-current-bcr.component.css'
})
export class ViewCurrentBcrComponent {

  bcr_status:string = 'current_bcr';
  account_id:string =  '';
  acct_id: number | null = null; // Store aid separately if needed
  isDevMode: boolean = false;
  aid:string = '';
  isLocal = environment.local;

  constructor( 
    private sharedServices: SharedServicesService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private apiServices: ApiCallsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
      this.acct_id = params['aid'] ? Number(params['aid']) : null; // Get aid as number
      this.isDevMode = params['oauth'] === 'isDev';
      // Ensure aid is assigned after query params are available
      this.aid = this.accountService.getAID();
    });
    if (!this.isLocal && isPlatformBrowser(this.platformId)) {
      this.login(); // Only run on browser
    }
    this.sharedServices.updateBCRStatus(this.bcr_status);
  }

  createBCR(){
    event.preventDefault(); // Prevent default routerLink action when clicking manually
    this.sharedServices.notifyCreateButtonClick();
    // ** Add redirect logic without affecting existing functionality **
    if (this.isDevMode && this.account_id) {
      this.router.navigate(['/create_bcr'], {
        queryParams: { aid: this.account_id, oauth: 'isDev' }
      });
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
