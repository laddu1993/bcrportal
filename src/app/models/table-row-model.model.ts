export interface TableRowModel {
    sku: string;
    model: string;
    description: string;
    invoice: string;
    serial: string;
    billed: number;
    msrp: number;
    current: number;
    credit: number;
    sell_amount: number;
    note: string;
    isManualEntry: boolean;
    isInventory: boolean;
}


export interface selectedInvoices {
    sku: string;
    model: string;
    description: string;
    invoice: string;
    serial: string;
    billed: number;
    msrp: number;
    current: number;
    credit: number;
    sell_amount: number;
    note: string;
    isManualEntry: boolean;
    isInventory: boolean;
}

export interface dealerTableModal {
    account: number;
    name: string;
    city: string;
    state: string;
    active: string;
    orgID: string;
}

export interface transferListModel {
    claim_id: number,
    claim_reference: string,
    org_from_id: number,
    org_from_account_number: string,
    org_from_name: string,
    org_from_city: string,
    org_from_state: string,
    org_to_id: number,
    org_to_account_number: string,
    org_to_name: string,
    org_to_city: string,
    org_to_state: string,
    created_date: string,
    status: string,
    incident_status: string,
    manager_approved: string,
    from_approved: string,
    to_approved: string,
    territory: string
}
