sap.ui.jsview("app.master.List1", {
    getControllerName: function() {
        return "app.master.List1";
    },

    /**
         * Handler to onBeforeShow event that fires by the NavContainer.<BR>
         * @param oEvent
         */
    onBeforeShow: function(oEvent) {
        this.getController().onBeforeShow(oEvent.data);
    },

    createContent: function(oController) {
        var view = this;

        this.oList = new sap.m.List({
            growing: true,
            growingThreshold: 10,
            growingScrollToLoad: true
        });

        this.itemTemplate = new sap.m.ObjectListItem({
            type: "Navigation",
            press: oController.onListItemTap,

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
            }), new sap.m.ObjectAttribute({
                title: oBundle.getText("SALES_ORDER_ID"),
                text: "{SALESORDERID}"
            })],

            firstStatus: new sap.m.ObjectStatus({
                text: {
                    path: "HISTORY.CREATEDAT",

                    type: new sap.ui.model.type.Date({
                        style: "short"
                    })
                }
            })
        });

        // create search field
        this.searchField = new sap.m.SearchField({
            placeholder: oBundle.getText("SEARCH_PLACEHOLDER"),

            layoutData: new sap.m.FlexItemData({
                growFactor: 1
            }),

            liveChange: [oController.onLiveChange, oController],
            maxLength: 127
        });

        var pull = new sap.m.PullToRefresh({
            description: "",
            refresh: [oController, oController.onPull]
        });

        //Create personalization button
        var oButton = new sap.m.Button({
            icon: "sap-icon://settings",
            tap: oController.onPersonalizationButtonTap,
            visible: !jQuery.device.is.desktop
        });

        var oNewButton = new sap.m.Button({
            icon: "sap-icon://add",
            press: [oController.onNewClicked, oController],
            text: oBundle.getText("NEW")
        });

        this.page = new sap.m.Page({
            title: oBundle.getText("MASTER_TITLE"),
            showNavButton: false,

            footer: new sap.m.Bar({
                enableFlexBox: true,
                contentRight: [oButton],
                contentLeft: [oNewButton]
            }),

            content: [pull, new sap.m.Bar({
                enableFlexBox: true,
                contentMiddle: [this.searchField]
            }), this.oList]
        });

        this.dialog = this.getDialog(this, oController);

        // done
        return this.page;
    },

    getDialog: function(view, oController) {
        var selectBuyer = new sap.m.Label({
            text: oBundle.getText("SELECT_BUYER")
        });

        selectBuyer.addStyleClass("alignText");

        return new sap.m.Dialog({
            title: oBundle.getText("CREATE"),

            buttons: [new sap.m.Button({
                text: oBundle.getText("SUBMIT"),
                press: [oController.onSubmit, oController]
            }), new sap.m.Button({
                text: oBundle.getText("CANCEL"),

                press: function() {
                    view.dialog.close();
                }
            })],

            content: [new sap.m.HBox({
                enableFlexBox: true,
                fitContainer: true,
                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,

                items: [selectBuyer, new sap.m.Select({
                    items: {
                        path: "/Buyer",

                        template: new sap.ui.core.Item({
                            text: "{COMPANYNAME}",
                            key: "{PARTNERID}"
                        })
                    }
                })]
            }), view.getItem(view, true)]
        });
    },

    // build dialog item row
    getItem: function(view, isFirstRow) {
        var selectProductTxt = new sap.m.Label({
            text: oBundle.getText("SELECT_PRODUCT")
        });

        selectProductTxt.addStyleClass("alignText");

        var addIcon = new sap.ui.core.Icon({
            src: "sap-icon://add",
            color: "#006400",
            size: "1.5rem",

            press: function(oEvent) {
                view.dialog.addContent(view.getItem(view, false));
            }
        });

        var deleteIcon = new sap.ui.core.Icon({
            src: "sap-icon://delete",
            color: "#49311c",
            size: "1.5rem",

            press: function(oEvent) {
                view.dialog.removeContent(oEvent.oSource.oParent.sId);
            }
        });

        var icon;

        if (isFirstRow) {
            icon = addIcon;
        } else {
            icon = deleteIcon;
        }

        icon.addStyleClass("iconPadding");

        var productSelect = new sap.m.Select({
            items: {
                path: "/ProductDetails",

                template: new sap.ui.core.Item({
                    text: "{PRODUCT_NAME}",
                    key: "{PRODUCTID}"
                })
            }
        });

        productSelect.addStyleClass("paddingLR");

        var quantityInput = new sap.m.Input({
            value: 1,
            type: sap.m.InputType.Number
        });

        quantityInput.addStyleClass("paddingLR");

        return new sap.m.HBox({
            enableFlexBox: true,
            fitContainer: true,
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
            items: [selectProductTxt, productSelect, quantityInput, icon]
        });
    }
});