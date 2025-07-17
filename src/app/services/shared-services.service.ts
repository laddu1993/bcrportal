import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TableRowModel, dealerTableModal, selectedInvoices } from '../models/table-row-model.model';

// export interface DealerTableModal {
//   account: number;
//   name: string;
//   city: string;
//   state: string;
//   active: string;
// }

@Injectable({
  providedIn: 'root'
})
export class SharedServicesService {

  private selectedServiceInvoice;
  private searchedServiceInvoices;
  private searchedSelectedServiceInvoices;
  private selectedTransferDetails;
  private initialCosts;
  private searchedDealaers;
  private storedTransferType;
  private displayedColumns;
  private claimID;
  private savedInvoices;
  private bcr_submitted_status;
  private sharedValues: any = {};

  // constructor() { }


  private toggleInvoiceSource = new BehaviorSubject<boolean>(null);
  toggleInvoice$ = this.toggleInvoiceSource.asObservable();

  private bcr_status_source = new BehaviorSubject<string>('');
  bcr_status$ = this.bcr_status_source.asObservable();

  private fromDealerSource = new Subject<string>();
  fromSearchtext$ = this.fromDealerSource.asObservable();

  private transferTypeSource = new Subject<string>();
  transferType$ = this.transferTypeSource.asObservable();

  private territoryFromSource = new Subject<string>();
  territoryFrom$ = this.territoryFromSource.asObservable();

  private territoryToSource = new Subject<string>();
  territoryTo$ = this.territoryToSource.asObservable();

  private dealerForInvoiceSource = new BehaviorSubject<string>('');
  dealerForInvoice$ = this.dealerForInvoiceSource.asObservable();

  private dealerType = new BehaviorSubject<string>('');
  dealerType$ = this.dealerType.asObservable();

  private selectedFromDealer = new BehaviorSubject<dealerTableModal[]>([]);
  selectedFromDealer$ = this.selectedFromDealer.asObservable();

  private selectedToDealer = new BehaviorSubject<dealerTableModal[]>([]);
  selectedToDealer$ = this.selectedToDealer.asObservable();

  private selectedInvoiceSource = new BehaviorSubject<TableRowModel | null>(null);
  selectedInvoice$ = this.selectedInvoiceSource.asObservable();

  private removedInvoiceSource = new BehaviorSubject<selectedInvoices | null>(null);
  removedInvoice$ = this.removedInvoiceSource.asObservable();

  private openEditModalSource = new BehaviorSubject<selectedInvoices | null>(null);
  openEditModal$ = this.openEditModalSource.asObservable();

  private updatedBCRSource = new Subject<selectedInvoices | null>();
  updatedBCR$ = this.updatedBCRSource.asObservable();

  private selectedInvoiceListSource = new BehaviorSubject<selectedInvoices | null>(null);
  selectedInvoiceList$ = this.selectedInvoiceListSource.asObservable();

  private updateCostsSource = new Subject<[]>();
  costsToBeUpdated$ = this.updateCostsSource.asObservable();

  private addManualBCRSource = new Subject<selectedInvoices | null>()
  addManualBCR$ = this.addManualBCRSource.asObservable();

  private clearComponentsSource = new BehaviorSubject<boolean>(null);
  clearComponents$ = this.clearComponentsSource.asObservable();

  private transferSource = new Subject<[]>();
  transfers$ = this.transferSource.asObservable();

  private selectedTransferSource = new Subject<[]>();
  selectedTransfers$ = this.selectedTransferSource.asObservable();

  private editTransferDetailsSource = new BehaviorSubject<[]>([]);
  editedTransfers$ = this.editTransferDetailsSource.asObservable();

  private createButtonClickSubject = new Subject<void>();
  createButtonClick$ = this.createButtonClickSubject.asObservable();

  private claimToBeDeletedSource = new BehaviorSubject<string>('');
  claimToBeDeleted$ = this.claimToBeDeletedSource.asObservable();

  private claimToDeleteSource = new Subject<string>();
  claimToDelete$ = this.claimToDeleteSource.asObservable();

  private accountTypeSource = new Subject<string>();
  accountType$ = this.accountTypeSource.asObservable();

  private claimToRemoveSource = new Subject<string>();
  claimToRemove$ = this.claimToRemoveSource.asObservable();

  private clearTransferSource = new Subject<void>();
  clearTransfer$ = this.clearTransferSource.asObservable();

  private confirmBcrSubmitSource = new Subject<boolean>();
  confirmBcrSubmit$ = this.confirmBcrSubmitSource.asObservable();

  private bcrSubmitStatusSource = new Subject<boolean>();
  bcrSubmitStatus$ = this.bcrSubmitStatusSource.asObservable();

  private deleteConfirmationSource = new BehaviorSubject<boolean>(false);
  deleteConfirmation$ = this.deleteConfirmationSource.asObservable();

  private submitBCRStatusSource = new Subject<boolean>();
  submitBCRStatus$ = this.submitBCRStatusSource.asObservable();

  private filterSubject = new BehaviorSubject<string | null>(null);
  filter$ = this.filterSubject.asObservable();

  private transferDetailsTrigger$ = new Subject<void>();
  public transferDetailsTriggerObservable$ = this.transferDetailsTrigger$.asObservable();

  triggerLoadTransferDetails() {
    this.transferDetailsTrigger$.next();
  }

  setFilter(filterValue: string) {
    this.filterSubject.next(filterValue);
  }

  setValues(values: any): void {
    this.sharedValues = values;
  }

  getValues(): any {
    return this.sharedValues;
  }

  notifyCreateButtonClick(): void {
    this.createButtonClickSubject.next();
  }

  updateBCRStatus(bcr_status) {
    this.bcr_status_source.next(bcr_status);
  }

  updateDealerSearchText(dealerSearchtext) {
    this.fromDealerSource.next(dealerSearchtext);
  }

  updateDealerType(typeDealer)
  {
    this.dealerType.next(typeDealer);
  }

  updateSelectedFromDealer(selectedDealerFrom) {
    this.selectedFromDealer.next(selectedDealerFrom);
  }

  updateSelectedToDealer(DealerToSelected) {
    this.selectedToDealer.next(DealerToSelected);
  }

  updateDealerForInvoice(searchedInvoiceDealer) {
    this.dealerForInvoiceSource.next(searchedInvoiceDealer);
  }

  updateSelectedInvoiceList(invoice: TableRowModel) {
    this.selectedInvoiceSource.next(invoice);
  }

  removeInvoice(removedInvoice: selectedInvoices) {
    this.removedInvoiceSource.next(removedInvoice);
  }

  openEditModal(editedInvoice: selectedInvoices, selectedInvoiceList){
    this.openEditModalSource.next(editedInvoice);
    this.selectedInvoiceListSource.next(selectedInvoiceList);
  }

  addManualBCR(newInvoice: selectedInvoices) {
    this.addManualBCRSource.next(newInvoice);
  }

  updateBCR(updatedInvoice: selectedInvoices){
    this.updatedBCRSource.next(updatedInvoice);
  }

  toggleInvoice(toggle)
  {
    this.toggleInvoiceSource.next(toggle);
    this.selectedInvoiceSource.next(null);
  }

  updateCosts(total_costs)
  {
    this.updateCostsSource.next(total_costs);
  }

  clearComponents(clearComponent)
  {
    this.clearComponentsSource.next(clearComponent);
  }

  saveTransferDetails(transferDetails)
  {
    this.transferSource.next(transferDetails);
  }

  passSelectedTransfer(transferElement,accountType)
  {
    this.selectedTransferSource.next(transferElement);
    this.accountTypeSource.next(accountType);
  }

  editTransferDetails(transferToBeEdited)
  {
    this.editTransferDetailsSource.next(transferToBeEdited);
  }

  storeData(data,type)
  {
    if(type == 'selectedInvoices')
    {
      this.selectedServiceInvoice = data;
    }
    if(type == 'searchedInvoices')
    {
      this.searchedServiceInvoices = data;
    }
    if(type == 'searchedSelectedInvoices')
    {
      this.searchedSelectedServiceInvoices = data;
    }
    if(type == 'selectedTransferDetails')
    {
      this.selectedTransferDetails = data;
    }
    if(type == 'costs')
    {
      this.initialCosts = data;
    }
    if(type == 'dealers')
    {
      this.searchedDealaers = data;
    }
    if(type == 'transferType')
    {
      this.storedTransferType = data;
    }
    if(type == "displayedColumns")
    {
      this.displayedColumns = data;
    }
    if(type == "claimID")
    {
      this.claimID = data;
    }
    if(type == "savedInvoices")
    {
      this.savedInvoices = data;
    }
    if(type == "bcr_submitted_status")
    {
      this.bcr_submitted_status = data;
    }
  }

  retrieveBCRStatus()
  {
    return this.bcr_submitted_status;
  }
  
  retrieveSavedInvoices()
  {
    return this.savedInvoices;
  }

  retrieveClaimID()
  {
    return this.claimID;
  }

  retrieveDisplayedColumns()
  {
    return this.displayedColumns;
  }

  retrieveTransferType()
  {
    return this.storedTransferType;
  }

  retrieveDealerSearch()
  {
    return this.searchedDealaers;
  }

  retrieveTransferDetails()
  {
    return this.selectedTransferDetails;
  }

  retrieveInitialCosts()
  {
    return this.initialCosts;
  }

  retrieveSelectedInvoiceData()
  {
    return this.selectedServiceInvoice;
  }

  retrieveSearchedInvoiceData()
  {
    return this.searchedServiceInvoices;
  }

  retrieveSearchedSelectedInvoiceData()
  {
    return this.searchedSelectedServiceInvoices;
  }

  deleteClaim(claimID)
  {
    this.claimToBeDeletedSource.next(claimID);
  }

  clearTransferDetails(): void
  {
    this.clearTransferSource.next();
  }

  confirmClaimDelete(claimToDelete, confirmation)
  {
    this.claimToDeleteSource.next(claimToDelete);
    // this.deleteConfirmationSource.next()
  }

  updateClaimList(claimToBeRemoved)
  {
    this.claimToRemoveSource.next(claimToBeRemoved);
    if(claimToBeRemoved == this.claimID)
    {
      this.claimID = '';
    }
  }

  confirmSubmit(status)
  {
    this.confirmBcrSubmitSource.next(status);
  }

  updateTransferType(transferType)
  {
    this.transferTypeSource.next(transferType);
  }

  updateFromTerritory(fromTerritory)
  {
    this.territoryFromSource.next(fromTerritory);
  }

  updateToTerritory(toTerritory)
  {
    this.territoryToSource.next(toTerritory);
  }

  updateBcrSubmitStatus(bcr_submit_status)
  {
    this.bcrSubmitStatusSource.next(bcr_submit_status);
  }

  updateSubmitBCRStatus(submit_bcr_status)
  {
    this.submitBCRStatusSource.next(submit_bcr_status);
  }
  
}

