jQuery.sap.declare("util.BusyDialogHandler");

function BusyDialog() {
    this.open = function() {
        this.oBusyDialog.open();
    };

    this.close = function() {
        this.oBusyDialog.close();
    };

    this.init = function() {
        this.oBusyDialog = new sap.m.BusyDialog();
        sap.ui.getCore().getEventBus().subscribe("busyDialog", "open", this.open, this);
        sap.ui.getCore().getEventBus().subscribe("busyDialog", "close", this.close, this);
    };
}

var busyDialog = new BusyDialog();
busyDialog.init();