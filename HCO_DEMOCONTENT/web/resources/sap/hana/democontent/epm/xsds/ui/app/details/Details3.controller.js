sap.ui.controller("app.details.Details3", {
    onBeforeShow: function(oData) {
        var view = this.getView();
        view.oHeader.bindElement(oData.bindingContext.getPath());

        view.oList.bindItems({
            path: oData.bindingContext.getPath() + "/SalesOrderItem",
            template: view.itemTemplate
        });
    },

    onNavButtonTap: function() {
        sap.ui.getCore().getEventBus().publish("nav", "back");
    }
});