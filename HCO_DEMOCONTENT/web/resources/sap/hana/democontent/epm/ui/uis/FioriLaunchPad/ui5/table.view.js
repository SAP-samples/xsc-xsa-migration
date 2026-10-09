(function() {
    "use strict";
    jQuery.sap.require("sap.ui.table.Table");

    /**
         * Test view with table and width: auto to check scroll
         */
    sap.ui.jsview("test.table", {
        // define the (default) controller type for this View
        getControllerName: function() {
            return "test.ui5";
        },

        // defines the UI of this View
        createContent: function(oController) {
            //Define some sample data
            var aData = [{
                lastName: "Dente",
                name: "Al",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 4
            }, {
                lastName: "Friese",
                name: "Andy",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person2.gif",
                gender: "male",
                rating: 2
            }, {
                lastName: "Mann",
                name: "Anita",
                checked: false,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 3
            }, {
                lastName: "Schutt",
                name: "Doris",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 4
            }, {
                lastName: "Open",
                name: "Doris",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 2
            }, {
                lastName: "Dewit",
                name: "Kenya",
                checked: false,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 3
            }, {
                lastName: "Zar",
                name: "Lou",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 1
            }, {
                lastName: "Burr",
                name: "Tim",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person2.gif",
                gender: "male",
                rating: 2
            }, {
                lastName: "Hughes",
                name: "Tish",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 5
            }, {
                lastName: "Lester",
                name: "Mo",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 3
            }, {
                lastName: "Case",
                name: "Justin",
                checked: false,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 3
            }, {
                lastName: "Time",
                name: "Justin",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 4
            }, {
                lastName: "Barr",
                name: "Gaye",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 2
            }, {
                lastName: "Poole",
                name: "Gene",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person2.gif",
                gender: "male",
                rating: 1
            }, {
                lastName: "Ander",
                name: "Corey",
                checked: false,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 5
            }, {
                lastName: "Early",
                name: "Brighton",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 3
            }, {
                lastName: "Noring",
                name: "Constance",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 4
            }, {
                lastName: "Haas",
                name: "Jack",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "male",
                rating: 2
            }, {
                lastName: "Tress",
                name: "Matt",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person2.gif",
                gender: "male",
                rating: 4
            }, {
                lastName: "Turner",
                name: "Paige",
                checked: true,
                linkText: "www.sap.com",
                href: "http://www.sap.com",
                src: "images/person1.gif",
                gender: "female",
                rating: 3
            }];

            //Create an instance of the table control
            var oTable2 = new sap.ui.table.Table({
                title: "Table with fixed columns Example",
                visibleRowCount: 15,
                firstVisibleRow: 10,
                selectionMode: sap.ui.table.SelectionMode.Single
            });

            //Define the columns and the control templates to be used
            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Last Name"
                }),

                template: new sap.ui.commons.TextView().bindProperty("text", "lastName"),
                sortProperty: "lastName",
                filterProperty: "lastName",
                width: "200px"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "First Name"
                }),

                template: new sap.ui.commons.TextField().bindProperty("value", "name"),
                sortProperty: "name",
                filterProperty: "name",
                width: "200px"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Checked"
                }),

                template: new sap.ui.commons.CheckBox().bindProperty("checked", "checked"),
                sortProperty: "checked",
                filterProperty: "checked",
                width: "200px",
                hAlign: "Center"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Web Site"
                }),

                template: new sap.ui.commons.Link().bindProperty("text", "linkText").bindProperty("href", "href"),
                sortProperty: "linkText",
                filterProperty: "linkText",
                width: "400px"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Image"
                }),

                template: new sap.ui.commons.Image().bindProperty("src", "src"),
                width: "200px",
                hAlign: "Center"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Gender"
                }),

                template: new sap.ui.commons.ComboBox({
                    items: [new sap.ui.core.ListItem({
                        text: "female"
                    }), new sap.ui.core.ListItem({
                        text: "male"
                    })]
                }).bindProperty("value", "gender"),

                sortProperty: "gender",
                filterProperty: "gender",
                width: "400px"
            }));

            oTable2.addColumn(new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "Rating"
                }),

                template: new sap.ui.commons.RatingIndicator().bindProperty("value", "rating"),
                sortProperty: "rating",
                filterProperty: "rating",
                width: "200px"
            }));

            //Create a model and bind the table rows to this model
            var oModel2 = new sap.ui.model.json.JSONModel();

            oModel2.setData({
                modelData: aData
            });

            oTable2.setModel(oModel2);
            oTable2.bindRows("/modelData");

            //Initially sort the table
            oTable2.sort(oTable2.getColumns()[0]);

            oController.getView().setWidth("auto");
            return oTable2;
        }
    });
})();