sap.ui.jsview("app.details.Details3", {
    getControllerName: function() {
        return "app.details.Details3";
    },

    /**
         * Handler to onBeforeShow event that fires by the NavContainer.<BR>
         * Note: If the view is already loaded and the bindingContext was changed, this method also called by the App.contoller
         * @param oEvent
         */
    onBeforeShow: function(oEvent) {
        this.getController().onBeforeShow(oEvent.data);
    },

    createContent: function(oController) {
        this.oHeader = new sap.m.ObjectHeader({
            title: {
                parts: [{
                    path: "Buyer/COMPANYNAME",
                    type: new sap.ui.model.type.String()
                }, {
                    path: "Buyer/LEGALFORM",
                    type: new sap.ui.model.type.String()
                }],

                formatter: function(companyName, legalForm) {
                    // string, string
                    if (companyName) {
                        if (legalForm) {
                            return companyName + " " + legalForm;
                        } else {
                            return companyName;
                        }
                    } else {
                        return "";
                    }
                },

                useRawValues: true
            },

            number: "{GROSSAMOUNT}",
            numberUnit: "{CURRENCY}",

            attributes: [new sap.m.ObjectAttribute({
                title: oBundle.getText("EMAIL"),
                text: "{Buyer/EMAILADDRESS}"
            }), new sap.m.ObjectAttribute({
                title: oBundle.getText("ADDRESS"),

                text: {
                    parts: [{
                        path: "Buyer/BUILDING",
                        type: new sap.ui.model.type.String()
                    }, {
                        path: "Buyer/STREET",
                        type: new sap.ui.model.type.String()
                    }, {
                        path: "Buyer/CITY",
                        type: new sap.ui.model.type.String()
                    }, {
                        path: "Buyer/COUNTRY",
                        type: new sap.ui.model.type.String()
                    }],

                    formatter: function(building, street, city, country) {
                        if (!building) {
                            building = "";
                        }

                        if (city) {
                            return building + " " + street + " " + city + " " + country;
                        } else {
                            return "";
                        }
                    },

                    useRawValues: true
                }
            })],

            firstStatus: new sap.m.ObjectStatus({
                text: {
                    path: "HISTORY.CREATEDAT",

                    type: new sap.ui.model.type.DateTime({
                        style: "medium"
                    })
                }
            })
        });

        this.itemTemplate = new sap.m.ObjectListItem({
            title: "{PRODUCT_NAME}",
            number: "{NETAMOUNT}",
            numberUnit: "{CURRENCY}",

            icon: {
                path: "PRODUCTID",

                formatter: function(value) {
                    if (!value) {
                        return;
                    }

                    return "/sap/hana/democontent/epm/data/images/" + value + ".jpg";
                }
            },

            attributes: [new sap.m.ObjectAttribute({
                title: oBundle.getText("PRODUCT_ID"),
                text: "{PRODUCTID}"
            }), new sap.m.ObjectAttribute({
                title: oBundle.getText("SALESORDERITEM"),
                text: "{SALESORDERITEM}"
            })],

            firstStatus: new sap.m.ObjectStatus({
                title: oBundle.getText("Quantity"),
                text: "{QUANTITY}"
            })
        });

        this.oList = new sap.m.List({
            inset: true,
            items: []
        });

        this.page = new sap.m.Page({
            title: oBundle.getText("DETAILS"),

            //set back button on details pages only on smartphones
            showNavButton: jQuery.device.is.phone,

            navButtonTap: [oController.onNavButtonTap, oController],
            content: [this.oHeader, this.oList],
            footer: new sap.m.Bar({})
        });

        // done
        return this.page;
    }
});