/* For type check JSDOC */
var ValueHelp;
var exports = {};
exports.default = ValueHelp;

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
         *
         * @param { typeof import("sap/ui/core/UIComponent").default } UIComponent
         * @param { typeof import("sap/ui/model/json/JSONModel").default } JSONModel
         * @param { typeof import("sap/m/SearchField").default } SearchField
         * @param { typeof import("sap/m/ColumnListItem").default } _ColumnListItem
         * @param { typeof import("sap/m/Input").default } Input
         * @param { typeof import("sap/m/Label").default } _Label
         * @param { typeof import("sap/ui/model/Filter").default } Filter
         * @param { typeof import("sap/ui/model/FilterOperator").default } FilterOperator
         * @param { typeof import("sap/ui/model/Context").default } Context
         * @param { typeof import("sap/ui/comp/valuehelpdialog/ValueHelpDialog").default } ValueHelpDialog
         * @param { typeof import("sap/ui/comp/filterbar/FilterBar").default } FilterBar
         * @param { typeof import("sap/ui/comp/filterbar/FilterGroupItem").default } FilterGroupItem
         * @returns { object }
         */
        function(
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

                ValueHelp = UIComponent.extend("<namespace>.util.ValueHelp", {

                        constructor: function(oView) {
                                this.oView = oView;
                                this.oBundle = oView.getModel("i18n").getResourceBundle();
                        },

                        /**
                         * Call generic value help Dialog
                         * 
                         * @this { ValueHelp }
                         * @param { import("types").GenericVHImport } oParams
                         * @returns { Promise<import("sap/ui/comp/valuehelpdialog/ValueHelpDialog").default> } VHDialog
                         */
                        _callGenericValueHelpRequested: async function(oParams) {
                                const { popupTitle, sourceMultiInput, model, entity, entityType, aFieldnames, isMultiInput } = oParams;
                                const oView = this.oView;
                                const oController = this;
                                const oMultiInputTarget = sourceMultiInput;

                                this.aFieldnames = aFieldnames;

                                var sModelName = model;
                                var oModel = oView.getModel(sModelName);

                                const entityName = aFieldnames[0].columnName;

                                const displayFormatProperty = "/#" + entityType + "/" + entityName + "/@sap:display-format";
                                const isUpperCase = oModel.getProperty(displayFormatProperty) === "UpperCase" ? true : false;



                                var oBasicSearchField = new SearchField();

                                var oDescription = aFieldnames.find(f => f.type === "descr");
                                const sPopupTitle = popupTitle;

                                var oValueHelpDialog = oController._getDialog({
                                        id: this.valueHelpId,
                                        isMultiInput: isMultiInput,
                                        title: sPopupTitle,
                                        key: aFieldnames.filter(f => f.type === "key")[0].columnName,
                                        keys: aFieldnames.filter(f => f.type === "key").map(mapitem => mapitem.columnName),
                                        descriptionKey: oDescription.columnName,
                                        filters: aFieldnames.map(oFieldName => {
                                                return {
                                                        "label": "/#" + entityType + "/" + oFieldName.columnName + "/@sap:label",
                                                        "name": oFieldName.columnName,
                                                        "value": oFieldName.initialFilterValue,
                                                        "visible": oFieldName.visible
                                                };
                                        }),
                                        isUpperCase: isUpperCase,
                                        model,
                                        entityType

                                });
                                oValueHelpDialog.setRangeKeyFields([{
                                        label: sPopupTitle,
                                        key: aFieldnames.filter(f => f.type === "key")[0].columnName,
                                        type: "string",
                                        typeInstance: new TypeString({}, {
                                                maxLength: 20
                                        })
                                },
                                ]);

                                var aInitialFilters = this._getInitialFilters(aFieldnames);

                                oValueHelpDialog.setBindingContext(new Context(oModel, ""));



                                oView.addDependent(oValueHelpDialog);

                                var oFilterBar = oValueHelpDialog.getFilterBar();
                                oFilterBar.setFilterBarExpanded(false);
                                oFilterBar.setBasicSearch(oBasicSearchField);

                                const aFilterRelevantCols = aFieldnames
                                        .filter(c => c.initialFilterValue === undefined)
                                        .map(c => { return { column: c.columnName }; });

                                oFilterBar.attachSearch(function() {
                                        oController._callFilterBarSearch(oValueHelpDialog, aFilterRelevantCols);
                                });
                                oBasicSearchField.attachSearch(function() {
                                        oController._callFilterBarSearch(oValueHelpDialog, aFilterRelevantCols);
                                });

                                oValueHelpDialog.getTableAsync().then(function(oTable) {
                                        oTable.setModel(oModel);
                                        var oColumnsModel = new JSONModel({
                                                cols: aFieldnames.filter(f => f.visible !== false).map(c => {
                                                        return {
                                                                label: oBundle.getText(c.columnName),
                                                                template: `${sModelName}>${c.columnName}`
                                                        };
                                                })
                                        });

                                        oTable.setModel(oColumnsModel, "columns");


                                        oTable.bindAggregation("rows", {
                                                model: sModelName,
                                                path: "/" + entity,
                                                filters: aInitialFilters
                                        });

                                        oValueHelpDialog.update();
                                });

                                oValueHelpDialog.attachOk(function(oEvent) {
                                        var aTokens = oEvent.getParameter("tokens");

                                        oMultiInputTarget.setTokens(aTokens);

                                        this.close();
                                });

                                oValueHelpDialog.attachCancel(function() {
                                        this.close();
                                });

                                oValueHelpDialog.attachAfterClose(function() {
                                        this.destroy();
                                });

                                oValueHelpDialog.open();
                                return oValueHelpDialog;
                        },

                        /**
                         * @this { ValueHelp }
                         * @returns { import("sap/ui/model/Filter").default[] } An array of filters
                         */
                        _getInitialFilters: function() {
                                var aInitialFilters = [];
                                this.aFieldnames.forEach(fnames => {
                                        if (fnames.initialFilterValue !== undefined && fnames.initialFilterValue !== "") {
                                                aInitialFilters.push(new Filter({
                                                        path: fnames.columnName,
                                                        operator: FilterOperator.EQ,
                                                        value1: fnames.initialFilterValue
                                                }));
                                        }
                                });
                                return aInitialFilters;
                        },

                        _getDialog: function({ title, key, keys, descriptionKey, filters, id, isUpperCase, model, entityType }) {

                                const sModelName = model === "" ? undefined : model;
                                const oView = this.oView;
                                const oModel = oView.getModel(sModelName);

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
                                                filterGroupItems: filters.filter(f => f.visible !== false).map(filter =>
                                                        new FilterGroupItem({
                                                                groupName: "__$INTERNAL$",
                                                                label: oModel.getProperty("/#" + entityType + "/" + filter.name + "/@sap:label"),
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

                        _callFilterBarSearch: function(oValueHelpDialog, aCols,) {
                                const oController = this;
                                var oFilterBar = oValueHelpDialog.getFilterBar();

                                oValueHelpDialog.getTableAsync().then(function(oTable) {
                                        var oBinding = oTable.getBinding("rows");
                                        var sSearchQuery = oFilterBar.getBasicSearchValue();
                                        var aFilters = oController._getInitialFilters();

                                        // Advanced search
                                        oFilterBar.getFilterGroupItems().forEach(function(o) {
                                                var oInput = o.getControl();
                                                if (oInput.getValue() && oInput.getEnabled()) {
                                                        aFilters.push(new Filter({
                                                                path: oInput.getName(),
                                                                operator: FilterOperator.EQ,
                                                                value1: oInput.getValue()
                                                        }));
                                                }
                                        });

                                        // Basic Search
                                        if (sSearchQuery) {
                                                aFilters.push(new Filter({
                                                        filters: aCols.map(function(col) {
                                                                return new Filter({ path: col.column, operator: FilterOperator.Contains, value1: sSearchQuery });
                                                        }),
                                                        and: false
                                                }));
                                        }

                                        oBinding.filter(aFilters);
                                });
                        }


                });

                return ValueHelp;
        });
