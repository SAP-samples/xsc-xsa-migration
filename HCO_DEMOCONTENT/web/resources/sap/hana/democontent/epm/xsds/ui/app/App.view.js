sap.ui.jsview("app.App", {
    getControllerName: function() {
        return "app.App";
    },

    createContent: function(oController) {
        // create splitApp
        this.splitApp = new sap.m.SplitApp({
            mode: "StretchCompressMode"
        });

        // create the first page in both master and detail areas 
        this.splitApp.addDetailPage(sap.ui.jsview("app.details.Empty", "app.details.Empty"));

        this.splitApp.addMasterPage(sap.ui.jsview("app.master.List1", "app.master.List1"));

        // navigate to the first page in both master and detail areas.
        // the toMaster must be called after calling the toDetail, because both of them point to the same reference in phone and 
        // the real first page that will be shown in phone is the page in master area. 
        this.splitApp.toDetail("app.details.Empty");

        this.splitApp.toMaster("app.master.List1");

        return new sap.m.Shell({
            title: oBundle.getText("SHELL_TITLE"),
            showLogout: false,
            app: this.splitApp
        });
    }
});