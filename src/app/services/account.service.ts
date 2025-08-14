import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AccountService {
  private aid: string | null = null;
  private cc: string | null = null;
  private encryptedAidParam: string | null = null;
  private oauth: string | null = null;
  private enableUrlEncryption: boolean = environment.enableUrlEncryption;

  constructor(
    private encryptionService: EncryptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    //alert(123);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const snapshot = this.route.snapshot;
      this.encryptedAidParam = snapshot.queryParamMap.get('aid');
      this.oauth = snapshot.queryParamMap.get('oauth');
      this.handleDecryptionLogic();
      this.cc = snapshot.queryParamMap.get('cc') || 'USF';
    });
  }
  
  private handleDecryptionLogic(): void {
    if (this.enableUrlEncryption && this.encryptedAidParam && this.oauth !== 'isDev') {
      this.encryptedAidParam = encodeURIComponent(this.encryptedAidParam).replace(/%20/g, '%2B');
      this.aid = this.encryptionService.decrypt(decodeURIComponent(this.encryptedAidParam));
      if (!this.aid) {
        console.error('Decryption returned a blank value. Redirecting to unauthorized page.');
        this.router.navigate(['unauthorized'], { replaceUrl: true });
      }
    } else {
      console.log('Original AID Value: ', this.encryptedAidParam);
      console.log('Encrypted AID Value: ', this.encryptionService.encrypt(this.encryptedAidParam || ''));
      this.aid = this.oauth === 'isDev' && this.enableUrlEncryption
        ? this.encryptedAidParam
        : this.encryptedAidParam;
    }
  }

  public getAID(): string | null {
    return this.aid;
  }
  
  public getCC(): string | null {
    return this.cc;
  }

}