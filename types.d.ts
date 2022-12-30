export type EnterValuesFields = {
    matnr: string,
    zmenge: string,
    grund: string,
    lgort?: string
}

type FieldNames = {
    type: string,
    columnName: string,
    visible?: boolean,
    initialFilterValue?: boolean,
    typeFormat?: string
}

export type GenericVHImport = {
    popupTitle: string, 
    sourceMultiInput: import("sap/m/Input").default, 
    model: string, 
    entity: string, 
    entityType: string, 
    aFieldnames: [FieldNames<string>],
    aPermanentFilters?: [import("sap/ui/model/Filter")],
    bCDSViewSearch?: boolean = false
    fnAttachOk?: function
}