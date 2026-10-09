// This is the top level controller which manages the page navigation and history handling.
sap.ui.controller("app.App", {
    onInit: function() {
        // Initialize history management
        var that = this;

        this.oEventBus = sap.ui.getCore().getEventBus();
        this.oEventBus.subscribe("nav", "to", this.navTo, this);
        this.oEventBus.subscribe("nav", "back", this.navBack, this);
        jQuery.sap.require("jquery.sap.history");

        jQuery.sap.history({
            routes: [{
                path: "page",

                handler: function(params, navType) {
                    if (!params || !params.id) {
                        jQuery.sap.log.error(oBundle.getText("LOGGER_ERROR_PARAM_ID", [params]));
                    } else {
                        that.oEventBus.publish("nav", "to", {
                            viewId: params.id,
                            navType: navType
                        });
                    }
                }
            }],

            defaultHandler: function(navType) {
                that.oEventBus.publish("nav", "to", {
                    viewId: "app.master.List1",
                    navType: navType
                });
            }
        });
    },

    // This is how we do the page back navigation
    navBack: function(sChannelId, sEventId, oData) {
        jQuery.sap.history.back();
        jQuery.sap.log.info("navBack");
    },

    // This method is called for multiple purpose:
    // 1. When navigate to a new page: history state is added
    // and page(view) is instantiated when it's loaded for the
    // first time
    // 2. When hardware back button is tapped.
    navTo: function(sChannelId, sEventId, oData) {
        var splitApp = this.getView().splitApp, sViewId = oData.viewId, oDataObject = oData.data, sNavType = oData.navType, oView;

        // check param
        if (!sViewId) {
            jQuery.sap.log.error(oBundle.getText("LOGGER_ERROR_PARAM_ID2", [sViewId]));
            return;
        }

        var bMaster = sViewId.indexOf("app.master.") !== -1;

        if (sNavType === jQuery.sap.history.NavType.Back) {
            if (bMaster) {
                splitApp.backMaster({
                    back: true
                });
            } else {
                splitApp.backDetail();
            }
        } else {
            oView = sap.ui.getCore().byId(sViewId);

            if (!oView) {
                // this is the lazy loading of views
                jQuery.sap.log.info(oBundle.getText("LOGGER_ERROR_LOADING_VIEW", [sViewId]));

                oView = sap.ui.jsview(sViewId, sViewId);
                bMaster ? splitApp.addMasterPage(oView) : splitApp.addDetailPage(oView);
            } else if (!bMaster) {
                // in case the navigation is from list to
                // details the details page is already loaded so
                // the navigation will be failed. therefore we
                // need to call before show event in order to
                // refresh the details page data.
                oView.onBeforeShow(oData);
            }

            bMaster ? splitApp.toMaster(sViewId, oDataObject) : splitApp.toDetail(sViewId, oDataObject);
        }

        // write history
        if (!sNavType && (bMaster || jQuery.device.is.phone)) {
            jQuery.sap.history.addHistory("page", {
                id: sViewId
            }, false);
        }

        // log
        jQuery.sap.log.info(
            oBundle.getText("LOGGER_INFO_LOADING_VIEW", [sViewId, !sNavType && bMaster, sNavType])
        );
    }
});