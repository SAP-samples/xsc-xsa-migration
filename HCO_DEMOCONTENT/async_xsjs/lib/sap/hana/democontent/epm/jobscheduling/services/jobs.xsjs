//Inserts timestamp into the 'JobsDemo' table.
async function createEntry(input) {
    var conn = await $.hdb.getConnection();
    var comment = input.description; 
    var desc = "'" + comment + "'";

    var query = 'insert into"sap.hana.democontent.epm.data::JobsDemo.Details"(TIME,SOURCE) values (now(), ' + desc + ')';
    await conn.executeUpdate(query);
    await conn.commit();   
    await conn.close();
}
export default {createEntry};
