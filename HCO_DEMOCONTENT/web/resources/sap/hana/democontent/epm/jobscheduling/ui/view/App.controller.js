jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("shine.job.scheduler.util.utility");
jQuery.sap.require("shine.job.scheduler.app.tileDialog");

sap.ui.controller("shine.job.scheduler.view.App", {
    handlePressHome: function(oEvent) {
        sap.m.URLHelper.redirect("/sap/hana/democontent/epm/ui/NewLaunchpad.html", false);
    },

    handleDelete: function(oEvent) {
        var oController = this;
        var payload = {};
        var i18n = this.getView().getModel("i18n");

        //get the Job Name and set the value in the payload
        payload.jobName = oEvent.getParameters().listItem.getCells()[0].getTitle();

        payload.jobAction = "deleteSchedule";

        // handle xsrf token
        // first obtain token using Fetch
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",

            success: function(data) {
                var msg = i18n.getProperty("JOB_SCHEDULE") + " " + payload.jobName + " " + i18n.getProperty("DELETED_SUCCESSFULLY");
                oController.handleRefresh();

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("JOB_DELETION_TITLE"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("JOB_DELETION_TITLE"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    },

    handleRefresh: function(oEvent) {
        var that = this;
        var i18n = this.getView().getModel("i18n");

        if (oEvent === undefined) {
            that.getView().getModel().refresh();
        } else if (oEvent.getSource().getTooltip() === i18n.getProperty("REFRESHJOBSCHEDULES")) {
            var oTable = that.getView().byId("idRuntimeJobSchedulesTable");

            var oTemplate = new sap.m.ColumnListItem({
                cells: [new sap.m.ObjectIdentifier({
                    title: "{NAME}",
                    class: "sapMTableContentMargin"
                }), new sap.m.ObjectNumber({
                    number: "{ID}"
                }), new sap.m.ObjectIdentifier({
                    title: "{JOBTYPE}",
                    class: "sapMTableContentMargin"
                })]
            });

            var oSorter = new sap.ui.model.Sorter("ID", true);
            oTable.unbindItems();
            oTable.bindItems("/RuntimeJobSchedules", oTemplate, oSorter);
        } else if (oEvent.getSource().getTooltip() === i18n.getProperty("REFRESHJOBDETAILS")) {
            var oTable = that.getView().byId("idJobDetailsTable");

            var oTemplate = new sap.m.ColumnListItem({
                cells: [new sap.m.ObjectIdentifier({
                    title: "{TIME}",
                    class: "sapMTableContentMargin"
                }), new sap.m.ObjectNumber({
                    number: "{SOURCE}"
                })]
            });

            var oSorter = new sap.ui.model.Sorter("TIME", true);
            oTable.unbindItems();
            oTable.bindItems("/JobDetails", oTemplate, oSorter);
        }
    },

    addSchedule: function(oEvent) {
        var oController = this;
        var i18n = this.getView().getModel("i18n");
        var payload = {};
        payload.jobName = this.getView().byId("jobNameInput").getValue();
        payload.jobDesc = this.getView().byId("jobDescInput").getValue();
        payload.xsCron = this.getView().byId("xsCronInput").getValue();
        payload.jobType = this.getView().byId("jobTypeSelect").getSelectedItem().getText();
        payload.jobAction = "addSchedule";

        //validation to check the user input
        if (payload.jobName === "" || payload.jobDesc === "" || payload.xsCron === "") {
            sap.m.MessageBox.show(i18n.getProperty("INPUT_ALL_FIELDS"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_SCH_ADDITION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        var letters = /^[A-Za-z0-9\s]+$/;

        if (!payload.jobName.match(letters) || !payload.jobDesc.match(letters)) {
            sap.m.MessageBox.show(i18n.getProperty("JOB_NAME_INVALID"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_SCH_ADDITION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        // handle xsrf token
        // first obtain token using Fetch
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",

            success: function(data) {
                var msg = i18n.getProperty("JOB_SCHEDULE") + " " + payload.jobName + " " + i18n.getProperty("ADDED_SUCCESSFULLY");
                oController.handleRefresh();
                oController.getView().byId("jobNameInput").setValue("");
                oController.getView().byId("jobDescInput").setValue("");
                oController.getView().byId("xsCronInput").setValue("");

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("JOB_SCH_ADDITION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("JOB_SCH_ADDITION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    },

    handleInfoHelp: function(oEvent) {
        var i18n = this.getView().getModel("i18n");
        var oHelpDialog = new HelpDialog();
        var oSourceId = oEvent.getSource().getId();
        oHelpDialog.addContent(oSourceId.split("--")[1], i18n);

        var dialog = new sap.m.Dialog({
            title: i18n.getProperty("INFOHELP_" + oSourceId.split("--")[1].toUpperCase() + "_TITLE"),
            type: "Message",
            content: oHelpDialog.oSimpleForm,

            beginButton: new sap.m.Button({
                text: "OK",

                press: function() {
                    dialog.close();
                }
            }),

            afterClose: function() {
                dialog.destroy();
            }
        });

        dialog.open();
    },

    handleXSCronHelp: function(oEvent) {
        var i18n = this.getView().getModel("i18n");
        var oLayout = sap.ui.xmlfragment("shine.job.scheduler.view.ValueHelp", this);

        // get the view and add the layout as a dependent. Since the layout is being put
        // into an aggregation any possible binding will be 'forwarded' to the layout.
        var oView = this.getView();

        oView.addDependent(oLayout);
        var that = this;

        sap.m.MessageBox.show(oLayout, {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: i18n.getProperty("XSCRON_VALUE_HELP"),
            actions: [sap.m.MessageBox.Action.OK],
            dialogId: "valueHelpMessageBoxId"
        });
    },

    saveJobConfig: function(oEvent) {
        var username, password, locale, starttime, endtime, active, starttime_value, endtime_value, startTimeDate, endTimeDate;
        var oController = this;
        var i18n = this.getView().getModel("i18n");

        //Validation - check if the job has been selected
        if (this.getView().byId("idXSJobsable").getSelectedItem() === null) {
            sap.m.MessageBox.show(i18n.getProperty("SELECT_A_JOB"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("SAVE_JOB_CONFIG"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        var jobname = this.getView().byId("idXSJobsable").getSelectedItem().getCells()[0].getTitle();
        username = this.getView().byId("userInput").getValue();
        password = this.getView().byId("passwordInput").getValue();
        locale = this.getView().byId("localeSelect").getSelectedItem().getText();
        starttime_value = this.getView().byId("idStartTime").getValue();
        endtime_value = this.getView().byId("idEndTime").getValue();

        //Validation - check if the required fields are filled in 
        if (username === "" || password === "" || starttime_value === "" || endtime_value === "") {
            sap.m.MessageBox.show(i18n.getProperty("INPUT_ALL_FIELDS"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("SAVE_JOB_CONFIG"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        //validation for the start date > end date
        startTimeDate = this.getView().byId("idStartTime").getDateValue();

        endTimeDate = this.getView().byId("idEndTime").getDateValue();

        if (startTimeDate && endTimeDate) {
            if (startTimeDate > endTimeDate) {
                sap.m.MessageBox.show(i18n.getProperty("START_DATE_GR_THAN_END_DATE"), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("SAVE_JOB_CONFIG"),
                    actions: [sap.m.MessageBox.Action.OK]
                });

                return;
                return;
            }
        }

        //the start time and end time formatting
        var START_TIME = starttime_value.replace(/\-/g, "/");

        starttime = START_TIME === "" ? "" : UTIL.formatUTCDateTime(new Date(START_TIME));
        var END_TIME = endtime_value.replace(/\-/g, "/");
        endtime = END_TIME === "" ? "" : UTIL.formatUTCDateTime(new Date(END_TIME));
        active = this.getView().byId("idActiveCheckbox").getSelected();
        var payload = {};
        payload.jobName = jobname;
        payload.username = username;
        payload.password = password;
        payload.locale = locale;
        payload.starttime = starttime;
        payload.endtime = endtime;
        payload.active = active;
        payload.jobAction = "saveJobConfig";

        // handle xsrf token
        // first obtain token using Fetch
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",

            success: function(data) {
                var msg = i18n.getProperty("JOB") + " " + payload.jobName + " " + i18n.getProperty("SAVED_SUCCESSFULLY");
                oController.handleRefresh();

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("SAVE_JOB_CONFIG"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("SAVE_JOB_CONFIG"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    },

    activateJob: function(oEvent) {
        var oController = this;
        var i18n = this.getView().getModel("i18n");

        //Validation - check if the job has been selected
        if (this.getView().byId("idXSJobsable").getSelectedItem() === null) {
            sap.m.MessageBox.show(i18n.getProperty("SELECT_A_JOB"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_ACTIVATION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        var jobname = this.getView().byId("idXSJobsable").getSelectedItem().getCells()[0].getTitle();
        var payload = {};
        payload.jobName = jobname;
        payload.username = sap.ui.getCore().byId("idDgUsername").getValue();
        payload.password = sap.ui.getCore().byId("idDgPassword").getValue();

        //validation for the username and the password field
        if (payload.username === "" || payload.password === "") {
            sap.m.MessageBox.show(i18n.getProperty("INPUT_ALL_FIELDS"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_ACTIVATION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        sap.ui.getCore().byId("idDgUsername").setValue("");
        sap.ui.getCore().byId("idDgPassword").setValue("");
        payload.jobAction = "activateJob";

        // handle xsrf token
        // first obtain token using Fetch
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",

            success: function(data) {
                var msg = i18n.getProperty("JOB") + " " + payload.jobName + " " + i18n.getProperty("ACTIVATED_SUCCESSFULLY");
                oController.handleRefresh();

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("JOB_ACTIVATION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("JOB_ACTIVATION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    },

    deactivateJob: function(oEvent) {
        var oController = this;
        var i18n = this.getView().getModel("i18n");

        //Validation - check if the job has been selected
        if (this.getView().byId("idXSJobsable").getSelectedItem() === null) {
            sap.m.MessageBox.show(i18n.getProperty("SELECT_A_JOB"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_DEACTIVATION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        var jobname = this.getView().byId("idXSJobsable").getSelectedItem().getCells()[0].getTitle();
        var payload = {};
        payload.jobName = jobname;
        payload.username = sap.ui.getCore().byId("idDgUsername").getValue();
        payload.password = sap.ui.getCore().byId("idDgPassword").getValue();

        //validation for the username and the password field
        if (payload.username === "" || payload.password === "") {
            sap.m.MessageBox.show(i18n.getProperty("INPUT_ALL_FIELDS"), {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: i18n.getProperty("JOB_DEACTIVATION"),
                actions: [sap.m.MessageBox.Action.OK]
            });

            return;
        }

        sap.ui.getCore().byId("idDgUsername").setValue("");
        sap.ui.getCore().byId("idDgPassword").setValue("");
        payload.jobAction = "deactivateJob";

        // handle xsrf token
        // first obtain token using Fetch
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        // add x-csrf-token in headers
        $.ajax({
            type: "POST",
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",
            data: JSON.stringify(payload),
            dataType: "json",

            success: function(data) {
                var msg = i18n.getProperty("JOB") + " " + payload.jobName + " " + i18n.getProperty("DEACTIVATED_SUCCESSFULLY");
                oController.handleRefresh();

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("JOB_DEACTIVATION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("JOB_DEACTIVATION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    },

    onOpenDialog: function(oEvent) {
        var srcText = oEvent.getSource().getText();
        this._action = srcText;

        if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment("shine.job.scheduler.view.Dialog", this);
            this.getView().addDependent(this._oDialog);
        }

        // toggle compact style
        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);

        this._oDialog.open();
    },

    onCloseDialog: function(oEvent) {
        var that = this;
        var i18n = this.getView().getModel("i18n");
        var actionMethod;
        var srcBtnText = oEvent.getSource().getText();

        if (srcBtnText === "Ok") {
            actionMethod = that._action;

            if (actionMethod === i18n.getProperty("ACTIVATEJOB")) {
                that.activateJob();
                that._oDialog.close();
            } else if (actionMethod === i18n.getProperty("DEACTIVATEJOB")) {
                that.deactivateJob();
                that._oDialog.close();
            }
        } else {
            sap.ui.getCore().byId("idDgUsername").setValue("");
            sap.ui.getCore().byId("idDgPassword").setValue("");
            this._oDialog.close();
        }
    },

    clearJobExecutionLogs: function(oEvent) {
        var that = this;
        var i18n = this.getView().getModel("i18n");
        var xsrf_token;

        $.ajax({
            type: "GET",
            async: false,
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs",
            contentType: "application/json",

            headers: {
                "x-csrf-token": "Fetch"
            },

            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader("x-csrf-token");
            }
        });

        $.ajax({
            url: "/sap/hana/democontent/epm/jobscheduling/services/jobScheduler.xsjs?cmd=clearJobLogs",
            type: "DELETE",

            headers: {
                "x-csrf-token": xsrf_token
            },

            contentType: "application/json",

            success: function(data) {
                var msg = i18n.getProperty("JOB_LOGS_DELETE_SUCCESS");

                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: i18n.getProperty("JOB_LOGS_DELETION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });

                that.getView().byId("refreshJobDetails").firePress();
            },

            error: function(xhr, ajaxOptions, thrownError) {
                sap.m.MessageBox.show(i18n.getProperty(JSON.parse(xhr.responseText).myResult), {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: i18n.getProperty("JOB_LOGS_DELETION"),
                    actions: [sap.m.MessageBox.Action.OK]
                });
            }
        });
    }
});