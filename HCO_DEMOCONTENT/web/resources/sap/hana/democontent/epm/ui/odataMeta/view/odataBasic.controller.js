sap.ui.controller("shine.democontent.epm.odatabasic.view.odataBasic", {
    onInit: function() {
        var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/businessPartners.xsodata", true);
        this.getView().setModel(oModel);
        var oTable = this.byId("idTable");
        var oMetaData = oModel.getServiceMetadata();

        for (var i = 0; i < oMetaData.dataServices.schema[0].entityType[0].property.length; i++) {
            var property = oMetaData.dataServices.schema[0].entityType[0].property[i];
            var oControl = new sap.ui.commons.TextField().bindProperty("value", property.name);

            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: property.name
                }),

                template: oControl,
                sortProperty: property.name,
                filterProperty: property.name,
                filterOperator: sap.ui.model.FilterOperator.EQ,
                flexible: true,
                width: "125px"
            }));
        }

        var oSorter = new sap.ui.model.Sorter("PARTNERID");
        oTable.bindRows("/BusinessPartners", oSorter);

        oTable.getBinding("rows").attachChange(function() {
            oTable.setTitle("Business Partners" + " (" + oTable.getBinding("rows").iLength + ")");
        });
    }
});