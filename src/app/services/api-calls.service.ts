import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiCallsService {

  crm_url = (environment.production)?environment.prodURL:environment.apiURL;
  isLocal = environment.local;
  noAuth = 'no_auth_';

  constructor(private http: HttpClient) { 
  }

  private tokenGenerated(): HttpHeaders {
    const token = localStorage.getItem('loginToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Accept': 'application/json'
    });
  }

  // Handle token refresh logic
  private handleTokenError(error: any, retryFunction: () => Observable<any>): Observable<any> {
    if (error.status === 401) { // Assuming 401 is the status code for token expiration
      return this.refreshTokenAndRetry(retryFunction);
    }
    return throwError(() => new Error('An error occurred'));
  }

  // Refresh token and retry the original request
  private refreshTokenAndRetry(retryFunction: () => Observable<any>): Observable<any> {
    return this.login().pipe( // Assuming you have a login method to refresh the token
      switchMap((res: any) => {
        // Store the new token in localStorage
        localStorage.setItem('loginToken', res.token);
        return retryFunction(); // Retry the original request
      }),
      catchError((loginError) => {
        console.error('Login failed', loginError);
        return throwError(() => new Error('An error occurred'));
      })
    );
  }
  
  login(): Observable<any> {
    const key = 'secretkey123456';
    const ivtest = '1100110011000111';
    const username = 'vinil@speridian.com';
    const password = '12345678';
    const encryptedPswd = 'IUKhJMNPHGmYmOOBHC4MjQ==';
    // Set the headers with an additional boolean parameter
    const headers = {
      'Content-Type': 'application/json',
      'Custom-Boolean-Header': 'true'  // Example boolean parameter in headers (convert boolean to string)
    };
    // Set the headers
    const body = {
      email: username,
      password: encryptedPswd
    };
    // Send the encrypted data via HTTPS with headers
    return this.http.post<any>(this.crm_url + 'login', body, {
      headers: headers
    });
  }

  getDealerDetails(account_number): Observable<any[]>{
    if(this.isLocal)
    {
      return this.http.get<any[]>(this.crm_url+this.noAuth+'dealer_search?acctNum='+account_number);
    }
    else
    {
      const headers = this.tokenGenerated();
      return this.http.get<any[]>(this.crm_url+'dealer_search?acctNum='+account_number, { headers }).pipe(
        catchError((error) => this.handleTokenError(error, () => this.getDealerDetails(account_number)))
      );
    }
    
  }

  getInvoiceList(account_number,sku,model,invoice,serial,age)
  {
    if(this.isLocal)
    {
      if(age != '')
      {
        return this.http.get<any[]>(this.crm_url+'no_auth_invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice+'&age='+age);
      }
      else
      {
        return this.http.get<any[]>(this.crm_url+'no_auth_invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice);
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(age != '')
      {
        return this.http.get<any[]>(this.crm_url+'invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice+'&age='+age, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.getInvoiceList(account_number,sku,model,invoice,serial,age)))
        );
      }
      else
      {
        return this.http.get<any[]>(this.crm_url+'invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.getInvoiceList(account_number,sku,model,invoice,serial,age)))
        );
      }
    }
  }

  submit_bcr(bcr_details: any): Observable<any>
  {
    if(this.isLocal)
    {
      if(bcr_details != null)
      {
        return this.http.post(this.crm_url+'no_auth_create_bcr', bcr_details);
      }
      else
      {
        return throwError(() => new Error('Invalid BCR details provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(bcr_details != null)
      {
        return this.http.post(this.crm_url+'create_bcr', bcr_details, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.submit_bcr(bcr_details)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid BCR details provided'));
      }
    }
  }

  update_bcr(bcr_transfer_details: any): Observable<any>
  {
    if(this.isLocal)
    {
      if(bcr_transfer_details != null)
      {
        return this.http.post(this.crm_url+'no_auth_update_claim', bcr_transfer_details);
      }
      else
      {
        return throwError(() => new Error('Invalid BCR details provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(bcr_transfer_details != null)
      {
        return this.http.post(this.crm_url+'update_claim', bcr_transfer_details, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.submit_bcr(bcr_transfer_details)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid BCR details provided'));
      }
    }
  }

  getTransferDetails(aid)
  {
    if(this.isLocal)
    {
      if(aid != '')
      {
        return this.http.get<any[]>(this.crm_url+'no_auth_get_current_transfers?aid='+aid);
      }
      else
      {
        return throwError(() => new Error('Invalid account details provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(aid != '')
      {
        return this.http.get<any[]>(this.crm_url+'get_current_transfers?aid='+aid, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.getTransferDetails(aid)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid account details provided'));
      }
    }
  }

  loadTransfer(claim_id)
  {
    if(this.isLocal)
    {
      if(claim_id != '')
      {
        return this.http.get<any[]>(this.crm_url+'no_auth_load_transfer_print?claim_id='+claim_id);
      }
      else
      {
        return throwError(() => new Error('Invalid claim id provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(claim_id != '')
      {
        return this.http.get<any[]>(this.crm_url+'load_transfer_print?claim_id='+claim_id, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.loadTransfer(claim_id)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid claim id provided'));
      }
    }   
  }

  deleteTransfer(claim_to_be_deleted)
  {
    if(this.isLocal)
    {
      if(claim_to_be_deleted != '')
      {
        return this.http.delete(this.crm_url+'no_auth_delete_transfer?claim_id='+claim_to_be_deleted+'&force=true');
      }
      else
      {
        return throwError(() => new Error('Invalid claim id provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(claim_to_be_deleted != '')
      {
        return this.http.delete(this.crm_url+'delete_transfer?claim_id='+claim_to_be_deleted+'&force=true', { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.deleteTransfer(claim_to_be_deleted)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid claim id provided'));
      }
    } 
  }

  getInventoryDetails(fromTerritory): Observable<any[]>{
    if(this.isLocal)
    {
      if(fromTerritory != '')
      {
        return this.http.get<any[]>(this.crm_url+'no_auth_demoinventory?territory='+fromTerritory);
      }
      else
      {
        return throwError(() => new Error('Invalid territory id provided'));
      }
    }
    else
    {
      const headers = this.tokenGenerated();
      if(fromTerritory != '')
      {
        return this.http.get<any[]>(this.crm_url+'demoinventory?territory='+fromTerritory, { headers }).pipe(
          catchError((error) => this.handleTokenError(error, () => this.getInventoryDetails(fromTerritory)))
        );
      }
      else
      {
        return throwError(() => new Error('Invalid territory id provided'));
      }
    }
  }

  import_bulk(fileData: FormData): Observable<any> {
    return this.http.post(this.crm_url + 'no_auth_import_bulk', fileData);
  }

  // For Local testing without authentication
  // getDealerDetails(account_number): Observable<any[]>{
  //   return this.http.get<any[]>(this.crm_url+(this.isLocal?this.noAuth:'')+'dealer_search?acctNum='+account_number);
  // }

  // getInvoiceList(account_number,sku,model,invoice,serial,age)
  // {
  //   if(age != '')
  //   {
  //     return this.http.get<any[]>(this.crm_url+'no_auth_invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice+'&age='+age);
  //   }
  //   else
  //   {
  //     return this.http.get<any[]>(this.crm_url+'no_auth_invoicelist?acctNum='+account_number+'&sku='+sku+'&model='+model+'&serial='+serial+'&invoice='+invoice);
  //   }
  // }

  // submit_bcr(bcr_details: any): Observable<any>
  // {
  //   if(bcr_details != null)
  //   {
  //     return this.http.post(this.crm_url+'no_auth_create_bcr', bcr_details);
  //   }
  //   else
  //   {
  //     return throwError(() => new Error('Invalid BCR details provided'));
  //   }
  // }

  // getTransferDetails(aid)
  // {
  //   if(aid != '')
  //   {
  //     return this.http.get<any[]>(this.crm_url+'no_auth_get_current_transfers?aid='+aid);
  //   }
  //   else
  //   {
  //     return throwError(() => new Error('Invalid account details provided'));
  //   }
  // }

  // loadTransfer(claim_id)
  // {
  //   if(claim_id != '')
  //   {
  //     return this.http.get<any[]>(this.crm_url+'no_auth_load_transfer_print?claim_id='+claim_id);
  //   }
  //   else
  //   {
  //     return throwError(() => new Error('Invalid claim id provided'));
  //   }
  // }

  // deleteTransfer(claim_to_be_deleted)
  // {
  //   if(claim_to_be_deleted != '')
  //   {
  //     return this.http.delete(this.crm_url+'no_auth_delete_transfer?claim_id='+claim_to_be_deleted+'&force=true');
  //   }
  //   else
  //   {
  //     return throwError(() => new Error('Invalid claim id provided'));
  //   }
  // }

  // getInventoryDetails(): Observable<any[]>{
  //   return this.http.get<any[]>(this.crm_url+'no_auth_demoinventory');
  // }
}
