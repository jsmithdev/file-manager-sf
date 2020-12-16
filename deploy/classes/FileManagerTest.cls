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
