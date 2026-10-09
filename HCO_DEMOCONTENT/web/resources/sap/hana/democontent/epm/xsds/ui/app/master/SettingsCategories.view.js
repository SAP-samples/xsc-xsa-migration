sap.ui.jsview("app.master.SettingsCategories", {
    getControllerName: function() {
        return "app.master.SettingsCategories";
    },

    createContent: function(oController) {
        //Create list with 1 list item (theme)
        this.oList = new sap.m.List({
            items: [new sap.m.StandardListItem({
                type: "Navigation",
                tap: oController.onListItemTap,
                title: oBundle.getText("THEME")
            }).data(sKeyTheme, sKeyTheme)]
        });

        this.page = new sap.m.Page({
            title: oBundle.getText("PERSONALIZATION"),
            showNavButton: true,
            navButtonTap: [oController.onNavButtonTap, oController],
            content: [this.oList]
        });

        return this.page;
    }
});