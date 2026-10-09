var query;
var createUserXmlTable = async function(connection, tableName) {
    await connection.executeUpdate('CREATE COLUMN TABLE ' + tableName + ' (xml TEXT)');
};

var excuteInsert = async function(connection, tableName, xmlList) {
    var i = 0;
    while(i < xmlList.data.length){
        xmlList.data[i] = xmlList.data[i].replace(/\s+/g, " ");
        query = 'INSERT INTO ' + tableName + ' values(?)';
        await connection.executeUpdate(query,xmlList.data[i]);
        await connection.commit();
        i++;
    }
};

var insertXmlDataToTable = async function(xmlList) {
    var connection = await $.hdb.getConnection();
    var userSchema = $.session.getUsername();
    var tableName = "USR_XML_DATA";
    var query = 'SELECT table_name FROM TABLES WHERE schema_name = ? AND table_name = ?';
    var rs = await connection.executeQuery(query,userSchema,tableName);
    if(!rs.length){
        createUserXmlTable(connection,tableName);
    }
    excuteInsert(connection,tableName,xmlList);
    await connection.commit();
    await connection.close();
};
export default {query,createUserXmlTable,excuteInsert,insertXmlDataToTable};
