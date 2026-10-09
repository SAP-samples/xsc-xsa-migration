// $.import("sap.hana.xs.libs.dbutils", "xsds");
// var XSDS = $.sap.hana.xs.libs.dbutils.xsds;
// var messages = XSDS.$importEntity("sap.hana.democontent.epm.data", 
//                               "Util.Messages", 
//                               {}, 
//                               { $schemaName: "SAP_HANA_DEMO" });
await $.import("sap.hana.democontent.epm.services", "lazyPost");
var messages = $.sap.hana.democontent.epm.services.lazyPost.entity;

function escape(v1) {
    var v2 = v1.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return v2;
}

function getMessage(messageClass, messageNumber, p1, p2, p3, p4) {
    var messageText = '';
    var lang = $.session.language.substring(0, 2).toLowerCase();
    
    var query = messages.$query()
            .$where(messages.MESSAGECLASS.$eq(messageClass)
                    .$and(messages.MESSAGENUMBER.$eq(messageNumber)
                    .$and(messages.LANGUAGE.$eq(lang))));
    var results = query.$execute();  

    if (results.length === 0) {
        lang = 'en';
        
        query = messages.$query()
            .$where(messages.MESSAGECLASS.$eq(messageClass)
                    .$and(messages.MESSAGENUMBER.$eq(messageNumber)
                    .$and(messages.LANGUAGE.$eq(lang))));
        results = query.$execute();
    }
    
    messageText = results[0].DESCRIPTION;

    if (p1) {
        messageText = messageText.replace("&1", escape(p1.toString()));
    }
    if (p2) {
        messageText = messageText.replace("&2", escape(p2.toString()));
    }
    if (p3) {
        messageText = messageText.replace("&3", escape(p3.toString()));
    }
    if (p4) {
        messageText = messageText.replace("&4", escape(p4.toString()));
    }
    return messageText;
}
export default {messages,escape,getMessage};
