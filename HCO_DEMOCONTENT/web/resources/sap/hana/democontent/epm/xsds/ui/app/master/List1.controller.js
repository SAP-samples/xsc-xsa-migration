sap.ui.controller("app.master.List1", {
    onInit: function(oEvent) {
        this.loadContent();
    },

    onBeforeShow: function(oData) {
        var view = this.getView();
        var newValue = view.searchField.getValue();

        if (newValue) {
            // in case we navigate back to this view and search was performed, 
            //we executes client side search with the inserted value
            this.onLiveChange({
                getParameters: function() {
                    return {
                        newValue: newValue
                    };
                }
            });
        }
    },

    loadContent: function() {
        var view = this.getView();

        if (sap.ui.Device.system.desktop) {
            view.oList.onAfterRendering = function() {
                var items = view.oList.getItems();

                if (items && items.length > 0) {
                    items[0].setSelected(true);

                    items[0].firePress({
                        id: items[0].getId()
                    });
                }
            };
        }

        view.oList.bindItems({
            path: "/SalesOrderHeader",
            template: view.itemTemplate,

            parameters: {
                expand: "Buyer"
            },

            sorter: new sap.ui.model.Sorter("SALESORDERID", true)
        });
    },

    onPersonalizationButtonTap: function() {
        //On tablet,we set the details section to empty when navigating to the personalization list
        if (!jQuery.device.is.phone) {
            var splitApp = sap.ui.getCore().byId("app.App").splitApp;
            splitApp.toDetail("app.details.Empty");
        }

        sap.ui.getCore().getEventBus().publish("nav", "to", {
            viewId: "app.master.SettingsCategories",
            data: ""
        });
    },

    onListItemTap: function(oEvent) {
        oEvent.oSource.setSelected(true);
        var oBindingContext = oEvent.oSource.getBindingContext();

        sap.ui.getCore().getEventBus().publish("nav", "to", {
            viewId: "app.details.Details3",

            data: {
                bindingContext: oBindingContext
            }
        });
    },

    onLiveChange: function(oEvent) {
        this.loadFilter(oEvent.getParameters().newValue);
    },

    loadFilter: function(oParam) {
        var view = this.getView();

        if (oParam === "*" || oParam === "" || oParam.length < 2) {
            view.oList.bindItems({
                path: "/SalesOrderHeader",
                template: view.itemTemplate,

                parameters: {
                    expand: "Buyer"
                },

                sorter: new sap.ui.model.Sorter("SALESORDERID", true)
            });
        } else {
            var aUrl = "/sap/hana/democontent/epm/services/soWorklistQuery.xsjs?cmd=filter" + "&query=" + escape(oParam) + "&page=1&start=0&limit=25";

            jQuery.ajax({
                url: aUrl,
                method: "GET",
                dataType: "json",
                success: this.onLoadFilter,
                error: this.onErrorCall
            });
        }
    },

    onLoadFilter: function(myJSON) {
        var aSuggestions = [];

        for (var i = 0; i < myJSON.length; i++) {
            aSuggestions[i] = myJSON[i].terms + " | Attribute: " + myJSON[i].attribute;
        }

        sap.ui.controller("app.master.List1").setFilter(aSuggestions);
    },

    onErrorCall: function(jqXHR, textStatus, errorThrown) {
        sap.ui.commons.MessageBox.show(jqXHR.responseText, "ERROR", sap.app.i18n.getText("ERROR_ACTION"));
        return;
    },

    setFilter: function(attribute) {
        //filterTerms = terms;
        var arr, grp;

        arr = new Array();
        grp = new Array();

        for (var i = 0; i < attribute.length; i++) {
            var mySplitResults = attribute[i].split(" | Attribute: ");
            gFilterTerms = mySplitResults[0];
            gFilterAttribute = mySplitResults[1];

            if (gFilterTerms == "*")
                this.emptyFilter();

            //Change from the Display Attribute Names to the property names in the ODATA service
            switch (gFilterAttribute) {
            case "Company Name":
            case "Firmenname":
                gFilterAttribute = "Buyer/COMPANYNAME";
                break;
            case "City":
            case "Stadt":
                gFilterAttribute = "Buyer/CITY";
                break;
            }

            jQuery.sap.require("sap.ui.model.Filter");
            jQuery.sap.require("sap.ui.model.FilterOperator");
            var aflt1 = new sap.ui.model.Filter(escape(gFilterAttribute), sap.ui.model.FilterOperator.EQ, gFilterTerms);
            arr.push(aflt1);
            grp.push(gFilterTerms);
        }

        //var fltr = new sap.ui.model.Filter(arr, false);
        var list = sap.ui.getCore().byId("__list0");

        if (arr && arr.length > 0) {
            var fltr = new sap.ui.model.Filter(arr, false);

            //Build OData Service Sorter by SO ID, and Item
            var sort1 = new sap.ui.model.Sorter("Buyer/COMPANYNAME", true);

            list.bindItems({
                path: "/SalesOrderHeader",

                parameters: {
                    expand: "Buyer"
                },

                template: sap.ui.jsview("app.master.List1").itemTemplate,
                sorter: sort1,
                filters: [fltr]
            });
        } else {
            list.removeAllItems();
        }
    },

    onPull: function(oEvent, oController) {
        oController.loadContent(oController.oBindingContext);
        this.hide();
    },

    onNewClicked: function(oEvent, oController) {
        var view = this.getView();
        view.dialog = view.getDialog(view, this);
        view.dialog.open();
    },

    onSubmit: function() {
        var view = this.getView();
        var content = view.dialog.getContent();
        var payload = {};
        payload.PARTNERID = content[0].getItems()[1].getSelectedKey();
        payload.SalesOrderItems = [];
        var productID = "";

        for (var i = 1; i < content.length; i++) {
            // productID += content[i].getItems()[1].getSelectedKey()  // product ID
            //         + ' ' + content[i].getItems()[2].getValue(); // quantity
            payload.SalesOrderItems.push({
                Product_Id: content[i].getItems()[1].getSelectedKey(),
                Quantity: content[i].getItems()[2].getValue()
            });
        }

        var xcsrfToken = "";

        view.getModel().refreshSecurityToken(function(data, response) {
            xcsrfToken = response.headers["x-csrf-token"];
        }, function() {}, false);

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/xsds/soCreateMultipleXSDS.xsjs",

            headers: {
                "x-csrf-token": xcsrfToken
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",
            success: function(data) {},

            dataFilter: function(data) {
                view.getModel().refresh();
                jQuery.sap.require("sap.m.MessageBox");

                sap.m.MessageBox.show(
                    oBundle.getText("SALES_ORDER_CREATE_COUNT", data.split("\n")[1].split(" ")[2]),
                    "SUCCESS",
                    oBundle.getText("SALES_ORDER_CREATED")
                );
            }
        });

        this.getView().dialog.close();
    }
});