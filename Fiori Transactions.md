# Fiori Transactions and Tools

## Fiori Related Transactions

| Transaction | Description |
|---|---|
| SEGW |  SAP Gateway Service Builder. Used to define and maintain OData services. |
| LPD_CUST |  Launchpad Content Manager.  Customizes the Fiori Launchpad configuration. |
| /IWFND/GW_CLIENT |  Gateway Client. A tool for testing OData services by sending HTTP requests. |
| /IWFND/MAINT_SERVICE |  Gateway Service Maintenance.  Used to activate, maintain, and register OData services in SAP Gateway. |
| /IWFND/ERROR_LOG |  Gateway Error Log.  Displays error logs for the SAP Gateway. |
| /UI2/FLPD_CONF |  Fiori Launchpad Designer Configuration. Used to configure Fiori Launchpad pages, catalogs, and groups at the system level. |
| /UI2/SEMOBJ |  Define Semantic Object.  Used to define semantic objects which enable navigation between Fiori apps. |
| /UI5/THEME_DESIGNER |  UI5 Theme Designer.  A tool to create custom themes for SAPUI5 applications. |
| /UI5/THEME_TOOL |   For downloading/uploading SAPUI5 themes. |
| /UI2/NWBC_CFG_SAP |  Configuration for the SAP NetWeaver Business Client with regards to Fiori integration. |
| /IWBEP/ERROR_LOG |  Backend Error Log for OData services. |
| /IWFND/CACHE_CLEANUP |  Gateway Cache Cleanup.  Clears the Gateway service metadata cache. |
| /IWBEP/ERROR_LOG |  Backend Error Log.  Displays error logs on the backend related to OData processing. |
| SUI_SUPPORT |  Support for UI Technologies.  Provides support tools for various UI technologies within SAP. |
| /IWFND/TRACES |  Gateway Traces. Used for tracing payload and performance details in SAP Gateway. |

## GATEWAY

```
SM05 > sessões HTTP Token issued
```

## TRacing tools

```
1.  Run transaction /IWFND/ERROR_LOG or /IWBEP/ERROR_LOG
2.  Choose Error Log-> Global Configuration.

    A pop-up will appear for changing the log level.
```

## Limpar cache do gateway

```
/n/iwfnd/cache_cleanup
```

## SAP Repo

* SAP Repo: [https://github.com/SAP](https://github.com/SAP)
* Open SAP course repo: [https://github.com/SAP/openSAP-ui5-course](https://github.com/SAP/openSAP-ui5-course)

## Report

Recalcula indice de blibliotecas ui5 para deteccao via webide no deploy (escalonar JOB)
ver SAP Note 2364579.

Report /UI5/APP_INDEX_CALCULATE

## Depois de transportar para o QAS erro de "Error - found in negative cache error for Component.js"

```
Hi Saurabh,
Is BSP activated ? Go to SICF -> sap/bc/bsp/zinv_apv. Activate it.
Check your odata node as well in sicf. I see zot_taskprocessing_*
After this clear all cache after import.
Clear metadata cache
Transaction: /IWFND/CACHE_CLEANUP on Gateway
Transaction: /IWBEP/CACHE_CLEANUP on Backend and Gateway
Run the report /UI2/CHIP_SYNCHRONIZE_CACHE. Make sure there is no error in the table /UI2/CHIP_CHDR
Run the report /UI2/DELETE_CACHE_AFTER_IMP and /UI2/DELETE_CACHE
Run the report /UI5/UPDATE_CACHEBUSTER and  /UI2/INVALIDATE_GLOBAL_CACHES
```

## Desabilita a autenticacao por SAML2 para URLS

```
?saml2=disabled
```

## remove extension de um servico nota 2520936 - Undo Redefining OData Service

```
/IWBEP/REG_MODEL     Maintain Model
/IWBEP/REG_SERVICE   Maintain Service
/IWBEP/REG_VOCAN     Maintain Vocabulary Annotations
```