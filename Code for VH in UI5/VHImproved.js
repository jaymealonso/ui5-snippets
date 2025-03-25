/* For type check JSDOC */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/SearchField",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Context",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/ui/model/type/String"
],
    /**
     * ValueHelp utility for creating generic value help dialogs
     * @param {sap.ui.core.UIComponent} UIComponent 
     * @param {sap.ui.model.json.JSONModel} JSONModel 
     * @param {sap.m.SearchField} SearchField 
     * @param {sap.m.ColumnListItem} _ColumnListItem 
     * @param {sap.m.Input} Input 
     * @param {sap.m.Label} _Label 
     * @param {sap.ui.model.Filter} Filter 
     * @param {sap.ui.model.FilterOperator} FilterOperator 
     * @param {sap.ui.model.Context} Context 
     * @param {sap.ui.comp.valuehelpdialog.ValueHelpDialog} ValueHelpDialog 
     * @param {sap.ui.comp.filterbar.FilterBar} FilterBar 
     * @param {sap.ui.comp.filterbar.FilterGroupItem} FilterGroupItem 
     * @param {sap.ui.model.type.String} TypeString 
     * @returns {object} ValueHelp component
     */
    function (
        UIComponent,
        JSONModel,
        SearchField,
        _ColumnListItem,
        Input,
        _Label,
        Filter,
        FilterOperator,
        Context,
        ValueHelpDialog,
        FilterBar,
        FilterGroupItem,
        TypeString
    ) {
        "use strict";

        return UIComponent.extend("<namespace>.util.ValueHelp", {
            /**
             * Constructor for ValueHelp component
             * @param {sap.ui.core.mvc.View} oView - The view associated with this component
             */
            constructor: function (oView) {
                // Call parent constructor
                UIComponent.prototype.constructor.call(this);

                // Store view and resource bundle
                this.oView = oView;
                this.oBundle = oView.getModel("i18n").getResourceBundle();
            },

            /**
             * Calls a generic value help dialog
             * @param {object} oParams - Configuration parameters for the value help dialog
             * @returns {Promise<sap.ui.comp.valuehelpdialog.ValueHelpDialog>} Value help dialog promise
             */
            _callGenericValueHelpRequested: async function (oParams) {
                const {
                    popupTitle,
                    sourceMultiInput,
                    model,
                    entity,
                    entityType,
                    aFieldnames,
                    isMultiInput
                } = oParams;

                // Validate input parameters
                if (!popupTitle || !sourceMultiInput || !model || !entity || !entityType || !aFieldnames) {
                    throw new Error("Missing required parameters for value help dialog");
                }

                const oView = this.oView;
                const oModel = oView.getModel(model);

                // Validate model
                if (!oModel) {
                    throw new Error(`Model '${model}' not found`);
                }

                // Extract key and description fields
                const keyFields = aFieldnames.filter(f => f.type === "key");
                const descriptionField = aFieldnames.find(f => f.type === "descr");

                if (!keyFields.length || !descriptionField) {
                    throw new Error("Missing key or description field configuration");
                }

                // Check if field should be uppercase
                const entityName = keyFields[0].columnName;
                const displayFormatProperty = `/#${entityType}/${entityName}/@sap:display-format`;
                const isUpperCase = oModel.getProperty(displayFormatProperty) === "UpperCase";

                // Create basic search field
                const oBasicSearchField = new SearchField();

                // Create value help dialog
                const oValueHelpDialog = this._getDialog({
                    id: this.valueHelpId,
                    isMultiInput: isMultiInput,
                    title: popupTitle,
                    key: keyFields[0].columnName,
                    keys: keyFields.map(mapItem => mapItem.columnName),
                    descriptionKey: descriptionField.columnName,
                    filters: aFieldnames.map(oFieldName => ({
                        label: `/#${entityType}/${oFieldName.columnName}/@sap:label`,
                        name: oFieldName.columnName,
                        value: oFieldName.initialFilterValue,
                        visible: oFieldName.visible !== false
                    })),
                    isUpperCase: isUpperCase,
                    model,
                    entityType
                });

                // Set range key fields with type configuration
                oValueHelpDialog.setRangeKeyFields([{
                    label: popupTitle,
                    key: keyFields[0].columnName,
                    type: "string",
                    typeInstance: new TypeString({}, { maxLength: 20 })
                }]);

                // Get initial filters
                const aInitialFilters = this._getInitialFilters(aFieldnames);

                // Set binding context
                oValueHelpDialog.setBindingContext(new Context(oModel, ""));

                // Add dialog as dependent to view
                oView.addDependent(oValueHelpDialog);

                // Configure filter bar
                const oFilterBar = oValueHelpDialog.getFilterBar();
                oFilterBar.setFilterBarExpanded(false);
                oFilterBar.setBasicSearch(oBasicSearchField);

                // Prepare columns for filtering
                const aFilterRelevantCols = aFieldnames
                    .filter(c => c.initialFilterValue === undefined)
                    .map(c => ({ column: c.columnName }));

                // Attach search events
                oFilterBar.attachSearch(() =>
                    this._callFilterBarSearch(oValueHelpDialog, aFilterRelevantCols)
                );
                oBasicSearchField.attachSearch(() =>
                    this._callFilterBarSearch(oValueHelpDialog, aFilterRelevantCols)
                );

                // Asynchronously set up table
                await oValueHelpDialog.getTableAsync().then(oTable => {
                    oTable.setModel(oModel);

                    // Create columns model
                    const oColumnsModel = new JSONModel({
                        cols: aFieldnames
                            .filter(f => f.visible !== false)
                            .map(c => ({
                                label: this.oBundle.getText(c.columnName),
                                template: `${model}>${c.columnName}`
                            }))
                    });
                    oTable.setModel(oColumnsModel, "columns");

                    // Bind table rows
                    oTable.bindAggregation("rows", {
                        model: model,
                        path: `/${entity}`,
                        filters: aInitialFilters
                    });

                    oValueHelpDialog.update();
                });

                // Attach dialog events
                oValueHelpDialog.attachOk(oEvent => {
                    const aTokens = oEvent.getParameter("tokens");
                    sourceMultiInput.setTokens(aTokens);
                    oValueHelpDialog.close();
                });

                oValueHelpDialog.attachCancel(() => oValueHelpDialog.close());
                oValueHelpDialog.attachAfterClose(() => oValueHelpDialog.destroy());

                // Open dialog
                oValueHelpDialog.open();
                return oValueHelpDialog;
            },

            /**
             * Generates initial filters based on field configurations
             * @param {Array} aFieldnames - Field configuration array
             * @returns {sap.ui.model.Filter[]} Array of initial filters
             */
            _getInitialFilters: function (aFieldnames) {
                return aFieldnames
                    .filter(fnames =>
                        fnames.initialFilterValue !== undefined &&
                        fnames.initialFilterValue !== ""
                    )
                    .map(fnames =>
                        new Filter({
                            path: fnames.columnName,
                            operator: FilterOperator.EQ,
                            value1: fnames.initialFilterValue
                        })
                    );
            },

            /**
             * Creates a value help dialog with configurable parameters
             * @param {object} dialogConfig - Dialog configuration object
             * @returns {sap.ui.comp.valuehelpdialog.ValueHelpDialog} Configured value help dialog
             */
            _getDialog: function (dialogConfig) {
                const {
                    title,
                    key,
                    keys,
                    descriptionKey,
                    filters,
                    id,
                    isUpperCase,
                    model,
                    entityType
                } = dialogConfig;

                const sModelName = model === "" ? undefined : model;
                const oModel = this.oView.getModel(sModelName);

                return new ValueHelpDialog({
                    id: id,
                    title: title,
                    key: key,
                    keys: keys,
                    descriptionKey: descriptionKey,
                    supportMultiselect: true,
                    supportRanges: true,
                    displayFormat: isUpperCase,
                    filterBar: new FilterBar({
                        filterGroupItems: filters
                            .filter(f => f.visible !== false)
                            .map(filter =>
                                new FilterGroupItem({
                                    groupName: "__$INTERNAL$",
                                    label: oModel.getProperty(`/#${entityType}/${filter.name}/@sap:label`),
                                    name: filter.name,
                                    control: new Input({
                                        name: filter.name,
                                        value: filter.value,
                                        editable: filter.value === undefined || filter.value === ""
                                    }),
                                    visibleInFilterBar: true
                                })
                            )
                    })
                });
            },

            /**
             * Performs filtering on the value help dialog's table
             * @param {sap.ui.comp.valuehelpdialog.ValueHelpDialog} oValueHelpDialog - Dialog to filter
             * @param {Array} aCols - Columns to search across
             */
            _callFilterBarSearch: function (oValueHelpDialog, aCols) {
                const oFilterBar = oValueHelpDialog.getFilterBar();

                oValueHelpDialog.getTableAsync().then(oTable => {
                    const oBinding = oTable.getBinding("rows");
                    const sSearchQuery = oFilterBar.getBasicSearchValue();
                    const aFilters = this._getInitialFilters(this.aFieldnames);

                    // Advanced search
                    oFilterBar.getFilterGroupItems().forEach(o => {
                        const oInput = o.getControl();
                        if (oInput.getValue() && oInput.getEnabled()) {
                            aFilters.push(new Filter({
                                path: oInput.getName(),
                                operator: FilterOperator.EQ,
                                value1: oInput.getValue()
                            }));
                        }
                    });

                    // Basic search across specified columns
                    if (sSearchQuery) {
                        aFilters.push(new Filter({
                            filters: aCols.map(col =>
                                new Filter({
                                    path: col.column,
                                    operator: FilterOperator.Contains,
                                    value1: sSearchQuery
                                })
                            ),
                            and: false
                        }));
                    }

                    oBinding.filter(aFilters);
                });
            }
        });
    }
);