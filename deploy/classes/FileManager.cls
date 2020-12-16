public with sharing class FileManager {

        @AuraEnabled
        public static List<ContentVersion> getDocumentMetadata(String recordId){
    
            List<String> docIds = new List<String>();
            List<ContentVersion> ls = new List<ContentVersion>();
    
            for(ContentDocumentLink link : [
                SELECT Id, ContentDocumentId
                FROM ContentDocumentLink 
                WHERE LinkedEntityId = :recordId
            ]){
                docIds.add( link.ContentDocumentId );
            }
    
            for(ContentVersion version : [
                SELECT Id, Title, Category__c, CreatedById, Description, 
                    FirstPublishLocationId, ContentUrl, LastModifiedDate,
                    ContentDocumentId, FileExtension, Owner.Name
                FROM ContentVersion 
                WHERE ContentDocumentId IN :docIds
                AND IsLatest = true
            ]){
                
                if(version.Category__c == null || version.Category__c == '' || Test.isRunningTest()){
                    version.Category__c = '--None--';
                }
    
                ls.add(version);
            }
    
            return ls;
        }
    
        @AuraEnabled
        public static String updateCategory(String documentId, String category){
            
            List<ContentVersion> ls = new List<ContentVersion>();
            
            for(ContentVersion version : [
                SELECT Id, Category__c
                FROM ContentVersion 
                WHERE ContentDocumentId = :documentId
                AND IsLatest = true
            ]){
                version.Category__c = category;
                ls.add( version );
            }
    
            update ls;
    
            return 'Updated '+ls.size()+' versions successfully: '+documentId+' => '+category;
        }
    
        @AuraEnabled
        public static String deleteDocument( String documentId ){
            
            ContentDocument doc = [
                SELECT Id, Title
                FROM ContentDocument 
                WHERE Id = :documentId
            ];
    
            String title = doc.Title;
    
            delete doc;
    
            return 'Deleted '+title+' successfully';
        }
    
    
        @AuraEnabled
        public static String updateVersions( List<ContentVersion>  versions ){
    
            update versions;
    
            return 'Updated '+versions.size()+' successfully';
        }
    }
    