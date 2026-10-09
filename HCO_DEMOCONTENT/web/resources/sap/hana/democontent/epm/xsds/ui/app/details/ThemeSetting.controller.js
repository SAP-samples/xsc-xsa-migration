sap.ui.controller("app.details.ThemeSetting", {
    onNavButtonTap: function() {
        sap.ui.getCore().getEventBus().publish("nav", "back");
    },

    onListItemTap: function(oEvent) {
        if (oEvent.getParameters().listItem.getSelected()) {
            //Get the selected theme and save it
            var item = oEvent.getParameters().listItem.data(sKeyTheme);

            sap.ui.getCore().applyTheme(item);
            oStorage.put(sKeyTheme, item);
        }
    }
});