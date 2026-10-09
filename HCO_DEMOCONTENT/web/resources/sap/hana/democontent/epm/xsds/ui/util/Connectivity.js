jQuery.sap.declare("util.Connectivity");
var serviceUrl = "/sap/hana/democontent/epm/services/salesOrders.xsodata";

function getServiceURL() {
    return serviceUrl;
}

function createModel() {
    var oModel = new sap.ui.model.odata.ODataModel(getServiceURL(), true, "", "", null, null, null, true);
    oModel.setCountSupported(false);
    oModel.setSizeLimit(50000);

    // set global models
    sap.ui.getCore().setModel(oModel);

    oModel.attachRequestCompleted(function(oEvent) {
        sap.ui.getCore().getEventBus().publish("busyDialog", "close");
    });

    oModel.attachRequestSent(function(oEvent) {
        sap.ui.getCore().getEventBus().publish("busyDialog", "open");
    });

    oModel.attachParseError(function(oEvent) {
        displayError({
            message: oEvent.getParameter("message"),
            responseText: oEvent.getParameter("responseText"),
            statusCode: oEvent.getParameter("statusCode"),
            statusText: oEvent.getParameter("statusText")
        });
    });

    oModel.attachRequestFailed(function(oEvent) {
        displayError({
            message: oEvent.getParameter("message"),
            responseText: oEvent.getParameter("responseText"),
            statusCode: oEvent.getParameter("statusCode"),
            statusText: oEvent.getParameter("statusText")
        });
    });
}