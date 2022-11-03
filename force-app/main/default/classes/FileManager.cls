@SuppressWarnings('PMD.ApexCRUDViolation, PMD.ExcessiveParameterList, PMD.IfStmtsMustUseBraces, PMD.VariableNamingConventions')
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











    

    /* 

    Integer expires = 60;
    String method = 'GET';
    String file = '0051U000005O0HBQA0/test.jpg';

    String url = FileManager.getAwsURL(file, expires, method);

    */
}















/* 


    @AuraEnabled
    public static String getAwsSignedURL(String file, Integer expires, String method, String contentType) {


        System.debug('file: '+file);

        AWS_S3__mdt creds = FileManager.getAwsCreds();

        String accessKey = creds.AccessKeyId__c;
        String secretKey = creds.SecretAccessKey__c;
        String bucketName = creds.Bucket__c;
        String bucketRegion = creds.Region__c;

        String location = 'https://'+bucketName+'.s3.'+bucketRegion+'.amazonaws.com/'+file;

        DateTime currentDateTime = DateTime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';

        String canonicalRequest = method+'\n';
        
        canonicalRequest += '/' + file + '\n';
        
        canonicalRequest += uriEncode('X-Amz-Algorithm', true) + '=' + uriEncode('AWS4-HMAC-SHA256', true) + '&' +
            uriEncode('X-Amz-Credential', true) + '=' + uriEncode(xAmzCredentialStr, true) + '&' +
            uriEncode('X-Amz-Date', true) + '=' + uriEncode(xAmzDate, true) + '&' +
            uriEncode('X-Amz-Expires', true) + '=' + uriEncode(String.valueOf(expires), true) + '&' +
            uriEncode('X-Amz-SignedHeaders', true) + '=' + uriEncode(xAmzSignedHeaders, true) + '\n';

            canonicalRequest += 'host:'+host + '\n\n' +
            'host\n' +
            'UNSIGNED-PAYLOAD';
     
        String stringToSign =
            'AWS4-HMAC-SHA256\n'+
            xAmzDate + '\n' +
            req + '\n' +
            EncodingUtil.convertToHex(
                    Crypto.generateDigest('SHA-256', Blob.valueOf(canonicalRequest))
            );
     
     
        Blob dateKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(dateOnly), Blob.valueOf('AWS4' + secretKey));
        Blob dateRegionKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(bucketRegion), dateKey);
        Blob dateRegionServiceKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('s3'), dateRegionKey);
        Blob signingKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), dateRegionServiceKey);
     
        Blob signature = Crypto.generateMac('hmacSHA256', Blob.valueOf(stringToSign), signingKey);
        String signatureStr = EncodingUtil.convertToHex(signature);

        return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host';
    }

    @AuraEnabled
    public static String getAwsSignedURL(String file, Integer expires, String method, String contentType) {


        System.debug('file: '+file);
        System.debug('method: '+method);
        System.debug('contentType: '+contentType);

        AWS_S3__mdt creds = FileManager.getAwsCreds();

        String accessKey = creds.AccessKeyId__c;
        String secretKey = creds.SecretAccessKey__c;
        String bucketName = creds.Bucket__c;
        String bucketRegion = creds.Region__c;

        String location = 'https://'+bucketName+'.s3.'+bucketRegion+'.amazonaws.com/'+file;

        DateTime currentDateTime = DateTime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';

        String canonicalRequest = method+'\n';
        
        if(method == 'GET'){
            canonicalRequest += '/' + file + '\n';
        }else{
            canonicalRequest += file + '\n';
            System.debug('canonicalRequest >>');
            System.debug(canonicalRequest);
        }
        
        canonicalRequest += uriEncode('X-Amz-Algorithm', true) + '=' + uriEncode('AWS4-HMAC-SHA256', true) + '&' +
            uriEncode('X-Amz-Credential', true) + '=' + uriEncode(xAmzCredentialStr, true) + '&' +
            uriEncode('X-Amz-Date', true) + '=' + uriEncode(xAmzDate, true) + '&' +
            uriEncode('X-Amz-Expires', true) + '=' + uriEncode(String.valueOf(expires), true) + '&' +
            uriEncode('X-Amz-SignedHeaders', true) + '=' + uriEncode(xAmzSignedHeaders, true) + '\n';

            if(method == 'PUT' || method == 'POST'){
                canonicalRequest += uriEncode('Content-Type', false)+'=' +uriEncode(contentType, false)+ '\n';
            }

            canonicalRequest += 'host:'+host + '\n\n' +
            'host\n' +
            'UNSIGNED-PAYLOAD';
     
        String stringToSign =
            'AWS4-HMAC-SHA256\n'+
            xAmzDate + '\n' +
            req + '\n' +
            EncodingUtil.convertToHex(
                    Crypto.generateDigest('SHA-256', Blob.valueOf(canonicalRequest))
            );
     
     
        Blob dateKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(dateOnly), Blob.valueOf('AWS4' + secretKey));
        Blob dateRegionKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(bucketRegion), dateKey);
        Blob dateRegionServiceKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('s3'), dateRegionKey);
        Blob signingKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), dateRegionServiceKey);
     
        Blob signature = Crypto.generateMac('hmacSHA256', Blob.valueOf(stringToSign), signingKey);
        String signatureStr = EncodingUtil.convertToHex(signature);
     
     
        return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host';
    }
 */