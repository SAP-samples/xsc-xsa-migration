var shine = {};
shine.usercrud = {};
shine.usercrud.User = (await $.import("sap.hana.democontent.epm.services", "userObject")).shine.usercrud.User;
var textAccess = await $.import("sap.hana.xs.i18n","text");
var bundle = textAccess.loadBundle("sap.hana.democontent.epm.i18n","messages");
var userList = [];
var bParseError = false;
var bConnectionError = false;
var xmlList = [];
var xml;

/* implement xsjs parser definition by defining event handlers 
* startElementHandler - triggered while parsing the start of an element (Ex:<User>)
* endElementHandler - triggered while parsing the end of an element (Ex:</User>)
* characterDataHandler -triggered while parsing the data(Ex:<User>data</User>)
*/
var xsjsParserDefinition = function() {
    //create a new $.util.SAXParser object
    var parser = new $.util.SAXParser();
    var user = {};
    var bFirstName = false;
    var bLastName = false;
    var bEmail = false;
    parser.startElementHandler = function(name, atts) {
        if (name === "User") {
            user = new shine.usercrud.User();
            user.setId(atts.id);
        } else if (name === "firstname") {
            bFirstName = true;
        } else if (name === "lastname") {
            bLastName = true;
        } else if (name === "email") {
            bEmail = true;
        }
    };
    parser.endElementHandler = function(name) {
        if (name === "User") {
            if(user.persistIntoTable()){
                userList.push(user);
            }else{
                bConnectionError = true;
            }
        }
    };
    parser.characterDataHandler = function(data) {
        if (bFirstName) {
            user.setFirstName(data);
            bFirstName = false;
        }
        if (bLastName) {
            user.setLastName(data);
            bLastName = false;
        }
        if (bEmail) {
            user.setEmail(data);
            bEmail = false;
        }
    };
    return parser;
};

/* parses the given xml*/
var createUserByParsingXml = function(xml, parser) {
    try {
        parser.parse(xml);
    } catch (e) {
        bParseError = true;
    }
};

/*handles multi-part request data uploaded from the UI*/
var handleMultiPartrequest = function(i){
    if ($.request.entities[i].contentType) {
        var type = $.request.entities[i].contentType;
        if (type === "text/xml") {
            xml = $.request.entities[i].body.asString();
            createUserByParsingXml(xml, xsjsParserDefinition());
            xmlList.push(xml);
        }
    }
};

var len = $.request.entities.length;
var i = 0;

while(i < len){
    handleMultiPartrequest(i);
    i++;
}

if (userList.length > 0) {
    $.response.status = $.net.http.OK;
    $.response.contentType = "application/json; charset=UTF-8";
    await $.response.setBody(JSON.stringify({
        "users": userList
    }));
    
/* Asynchronous request completion */    
    $.response.followUp({
        uri: "sap.hana.democontent.epm.services:xmlSave.xsjs",
        functionName: "insertXmlDataToTable",
        parameter: {
            data: xmlList
        }
    });
} else if(!bConnectionError && !bParseError && userList.length === 0 ){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(bundle.getText("NO_USR_FND"));
} else if(bConnectionError){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(bundle.getText("CREATE_USR_ERROR"));
} else if(bParseError){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(bundle.getText("PARSE_ERROR"));
}
else{
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
}
export default {shine,textAccess,bundle,userList,bParseError,bConnectionError,xmlList,xml,xsjsParserDefinition,createUserByParsingXml,handleMultiPartrequest,len,i};
