sap.ui.controller("shine.democontent.epm.odatabasic.view.odataBasic", {
    onInit: function() {
        var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/businessPartners.xsodata", true);
        this.getView().setModel(oModel);
        var oTable = this.byId("idTable");

        oTable.getBinding("rows").attachChange(function() {
            oTable.setTitle("Business Partners" + " (" + oTable.getBinding("rows").iLength + ")");
        });
    }
});