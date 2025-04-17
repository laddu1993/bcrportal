import { Component } from '@angular/core';
import { SharedServicesService } from '../../services/shared-services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallsService } from '../../services/api-calls.service';
import { AccountService } from '../../services/account.service';

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

  constructor( 
    private sharedServices: SharedServicesService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private apiServices: ApiCallsService
  ) { 
    // Login moved from constructor to ngOnInit
    this.login();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.account_id = params['aid'];
      this.acct_id = params['aid'] ? Number(params['aid']) : null; // Get aid as number
      this.isDevMode = params['oauth'] === 'isDev';
  
      // Ensure aid is assigned after query params are available
      this.aid = this.accountService.getAID();
    });

    this.sharedServices.updateBCRStatus(this.bcr_status);
  }

  createBCR()
  {
    event.preventDefault(); // Prevent default routerLink action when clicking manually
    this.sharedServices.notifyCreateButtonClick();
    // ** Add redirect logic without affecting existing functionality **
    if (this.isDevMode && this.account_id) {
      this.router.navigate(['/create_bcr'], {
        queryParams: { aid: this.account_id, oauth: 'isDev' }
      });
    }
  }

  login(): void {
    this.apiServices.login().subscribe(
      (res: any) => {
        if (res && res.token) {
          // Store the login token in local storage
          localStorage.setItem('loginToken', res.token);
        } else {
          console.error('Login failed: Token not received.');
        }
      },
      (error) => {
        console.error('Error during login:', error);
        // Optionally handle login failure (e.g., display an error message)
      }
    );
  }

}
