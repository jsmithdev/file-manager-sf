@IsTest
public with sharing class FileManagerTest {

    @isTest
    public static void doFileManagerTest(){

        Account acc = new Account();
        acc.Name = 'test';
        insert acc;

        ContentVersion version =new ContentVersion();
        version.Title='test';
        version.PathOnClient ='test';
        version.FirstPublishLocationId = acc.Id;
        version.VersionData = EncodingUtil.base64Decode('test');
        insert version;

        List<ContentVersion> ls = FileManager.getDocumentMetadata(acc.Id);

        String docId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :version.Id].ContentDocumentId;
        
        FileManager.updateCategory(docId, 'General');

        FileManager.updateVersions( ls );

        FileManager.deleteDocument(docId);
    }
}
/* 


    /**
     * @description Returns a list of files via lookup fields populated on record of the id given
     * @param recordId The id of the record to get lookup files for
     * @return List<ContentVersion> A list of ContentVersions / files (minus actual data)
     *
    @AuraEnabled
    public static List<ContentVersion> getChildFiles(Id recordId, String childObject, List<String> fields) {

        String query = 'SELECT Id, ';

        for(String s : fields) {
            query += s;
            if(!(fields.indexOf(s) == fields.size()-1)) {
                query += ', ';
            }
        }

        query += ' FROM ' + childObject;

        query += ' WHERE Id = \''+recordId+'\'';

        List<String> recordIds = new List<String>();

        for(sObject s : Database.query(query)) {
            recordIds.add(s.Id);
        }

        List<String> docIds = new List<String>();

        for(ContentDocumentLink link : [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId IN :recordIds
        ]){
            docIds.add( link.ContentDocumentId );
        }

        return [
            SELECT Id, Title, Description, LastModifiedDate,
                ContentDocumentId, FileExtension, Owner.Name
            FROM ContentVersion 
            WHERE ContentDocumentId IN :docIds
            AND IsLatest = true
        ];
    }

    /**
     * @description Returns a list of files via lookup fields populated on record of the id given
     * @param recordId The id of the record to get lookup files for
     * @return List<ContentVersion> A list of ContentVersions / files (minus actual data)
     *
    @AuraEnabled
    public static List<ContentVersion> getCustomLookupFiles(Id recordId){

        String objType = recordId.getSObjectType().getDescribe().getName();

        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType schemaType = schemaMap.get(objType);
        Map<String, Schema.SObjectField> fieldMap = schemaType.getDescribe().fields.getMap();

        List<String> customLookups = new List<String>();
        // Get custom lookup fields      
        for (String keys: fieldMap.keySet()) {

            String fieldName = fieldMap.get(keys).getDescribe().getName();

            Schema.DisplayType fieldType = fieldMap.get(fieldName).getDescribe().getType();
            if(fieldType == Schema.DisplayType.Reference) {
                if(fieldName.endsWith('__c')) {
                    customLookups.add(fieldName);
                }
            }
        }

        String query = 'SELECT Id, Name, ';

        for(String s : customLookups) {
            query += s;
            if(!(customLookups.indexOf(s) == customLookups.size()-1)) {
                query += ', ';
            }
        }

        query += ' FROM ' + objType;

        query += ' WHERE Id = \''+recordId+'\'';

        List<SObject> records = Database.query(query);

        List<String> lookupIds = new List<String>();

        for(sObject s : records) {
            for(String field : customLookups) {
                String value = (String)s.get(field);
                if(value != null) {
                    lookupIds.add(value);
                }
            }
        }

        List<String> docIds = new List<String>();

        for(ContentDocumentLink link : [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId IN :lookupIds
        ]){
            docIds.add( link.ContentDocumentId );
        }

        return [
            SELECT Id, Title, Description, LastModifiedDate,
                ContentDocumentId, FileExtension, Owner.Name
            FROM ContentVersion 
            WHERE ContentDocumentId IN :docIds
            AND IsLatest = true
        ];
    }
}



/* 
List<ContentDocumentLink> queriedLinks = [
    SELECT Id, ContentDocumentId, shareType, ContentDocument.Title
    FROM ContentDocumentLink
    WHERE LinkedEntityId = 'a9T6t000000LANZEA4'
];

System.debug('queriedLinks: ' + queriedLinks);

delete queriedLinks;

System.debug('queriedLinks: ' + queriedLinks);
*/

/* 

Id recordId = 'a9S6t000000KzxyEAC';


*/
