/* 
    FileManagerAws is a class that provides a simple interface to the AWS S3 API.
    https://docs.aws.amazon.com/general/latest/gr/sigv4-create-canonical-request.html
*/
@SuppressWarnings('PMD.ApexCRUDViolation, PMD.IfElseStmtsMustUseBraces, PMD.ApexSuggestUsingNamedCred, PMD.ExcessiveParameterList, PMD.IfStmtsMustUseBraces, PMD.VariableNamingConventions')
public with sharing class FileManagerAws {

    /* 
    System.debug(FileManagerAws.getCredentials());
    */
    public static AWS_S3__mdt getCredentials(){
        return [
            SELECT Id, Bucket__c, Region__c, IdentityPoolId__c, AccessKeyId__c, SecretAccessKey__c
            FROM AWS_S3__mdt
            LIMIT 1
        ];
    }

    public class Metadata {
            
        public String method;
        public String key;// 0050x00000B0Y0j/test.jpg
        public String path;// 0050x00000B0Y0j
        public String name;// test.jpg
        public String type; // image/jpeg
        public String length; // 123456
        public String timestamp; // new Date()
        public Integer expires = 60;
    }

    public class File {
        public String Name;
        public String Key;
        public String LastModified;
        public String ETag;
        public String Size;
        public String StorageClass;

        public void put(String key, String value){
            if(key == 'Key') {
                this.Key = value;
                this.Name = value.substring(value.lastIndexOf('/')+1);
            }
            if(key == 'LastModified') this.LastModified = value;
            if(key == 'ETag') this.ETag = value;
            if(key == 'Size') this.Size = value;
            if(key == 'StorageClass') this.StorageClass = value;
        }

        public String get(String key){
            if(key == 'Key') return this.Key;
            if(key == 'Name') return this.Name;
            if(key == 'LastModified') return this.LastModified;
            if(key == 'ETag') return this.ETag;
            if(key == 'Size') return this.Size;
            if(key == 'StorageClass') return this.StorageClass;
            return '';
        }
    }


    /* 

    Integer expires = 60;
    String path = '0051U000005O0HBQA0';
    List<FileManagerAws.File> ls = FileManagerAws.ls(path, expires);
    System.debug('Files:');
    System.debug(ls);
    System.debug('');

    */
    @AuraEnabled
    public static List<File> ls(String path, Integer expires) {

        AWS_S3__mdt creds = FileManagerAws.getCredentials();

        String accessKey = creds.AccessKeyId__c;
        String secretKey = creds.SecretAccessKey__c;
        String bucketName = creds.Bucket__c;
        String bucketRegion = creds.Region__c;
        String method = 'GET';

        String location = 'https://'+bucketName+'.s3.'+bucketRegion+'.amazonaws.com';

        DateTime currentDateTime = DateTime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';

        HttpRequest request = new HttpRequest();
        request.setMethod(method);
        request.setHeader('Host', host);
        request.setHeader(
            uriEncode('X-Amz-Algorithm', true),
            uriEncode('AWS4-HMAC-SHA256', true)
        );
        request.setHeader(
            uriEncode('X-Amz-Credential', true),
            uriEncode(xAmzCredentialStr, true)
        );
        request.setHeader(
            uriEncode('X-Amz-Date', true),
            uriEncode(xAmzDate, true)
        );
        
        request.setEndpoint(location+ '?prefix='+path);

        Http http = new Http();
        
        HttpResponse res = http.send(request);

        System.debug(res);

        Dom.Document doc = res.getBodyDocument();
        
        //Retrieve the root element for this document.
        Dom.XMLNode result = doc.getRootElement();
        
        List<File> files = new List<File>();

        // loop through the child elements.
        // deserialize the Contents xml into a list of files
        for(Dom.XMLNode child : result.getChildElements()) {
           // String key = child.getText();
           // if(key == 'Contents')
           //System.debug(key);
            FileManagerAws.File file = new FileManagerAws.File();

            for(Dom.XMLNode content : child.getChildElements()){
                file.put(content.getName(), content.getText());
            }

            if(file.get('Key') != null) files.add(file);
        }

        return files;
    }

    
    /* 


    FileManagerAws.Metadata meta = new FileManagerAws.Metadata();
    meta.method = 'GET';
    meta.key = '0051U000005O0HBQA0/test.jpg';
    meta.expires = 60;

    String url = FileManagerAws.generateSignedUrl(meta);
    System.debug(url);
    */
    @AuraEnabled
    public static String generateSignedUrl(Metadata md) {

        System.debug('Key: '+md.Key);

        AWS_S3__mdt creds = FileManagerAws.getCredentials();

        return md.Method == 'POST'
            ? getSignedUrlPost(md, creds)
            : getSignedUrl(md, creds);
    }

    public static String getSignedUrl(Metadata md, AWS_S3__mdt creds){

        String accessKey = creds.AccessKeyId__c;
        String secretKey = creds.SecretAccessKey__c;
        String bucketName = creds.Bucket__c;
        String bucketRegion = creds.Region__c;

        String location = 'https://'+bucketName+'.s3.'+bucketRegion+'.amazonaws.com/'+md.Key;

        DateTime currentDateTime = DateTime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';

        String canonicalRequest = md.Method+'\n'+'/' + md.Key + '\n';
        
        canonicalRequest += uriEncode('X-Amz-Algorithm', true) + '=' + uriEncode('AWS4-HMAC-SHA256', true) + '&' +
            uriEncode('X-Amz-Credential', true) + '=' + uriEncode(xAmzCredentialStr, true) + '&' +
            uriEncode('X-Amz-Date', true) + '=' + uriEncode(xAmzDate, true) + '&' +
            uriEncode('X-Amz-Expires', true) + '=' + uriEncode(String.valueOf(md.Expires), true) + '&' +
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
     
     
        return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(md.Expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host';
    }

    public static String getSignedUrlPost(Metadata md, AWS_S3__mdt creds){

        String accessKey = creds.AccessKeyId__c;
        String secretKey = creds.SecretAccessKey__c;
        String bucketName = creds.Bucket__c;
        String bucketRegion = creds.Region__c;

        String location = 'https://'+bucketName+'.s3.'+bucketRegion+'.amazonaws.com/'+md.Key;

        DateTime currentDateTime = DateTime.now();
        String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
        String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
        String xAmzCredentialStr = accessKey + '/' + req;
        String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
        String xAmzSignedHeaders = 'host';
        String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';

        String canonicalRequest = md.Method+'\n'+'/' + md.Key + '\n';
        
        canonicalRequest += uriEncode('X-Amz-Algorithm', true) + '=' + uriEncode('AWS4-HMAC-SHA256', true) + '&' +
            uriEncode('X-Amz-Credential', true) + '=' + uriEncode(xAmzCredentialStr, true) + '&' +
            uriEncode('X-Amz-Date', true) + '=' + uriEncode(xAmzDate, true) + '&' +
            uriEncode('X-Amz-Expires', true) + '=' + uriEncode(String.valueOf(md.Expires), true) + '&' +
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
     
     
        return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(md.Expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host';
    }





    public static String uriEncode(String input, Boolean encodeSlash) {
        String result = '';

        for (Integer i = 0; i < input.length(); i++) {
            String ch = input.substring(i, i + 1);

            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a'
            && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' ||
            ch == '-' || ch == '~' || ch == '.') {
            result += ch;
            } else if (ch == '/') {
            result += encodeSlash ? '%2F' : ch;
            } else {
                String hexValue = EncodingUtil.convertToHex(Blob.valueOf(ch)).toUpperCase();

                if (hexValue.length() == 2) {
                    result += '%' + hexValue;
                } else if (hexValue.length() == 4) {
                    result += '%' + hexValue.substring(0, 2) + '%' + hexValue.substring(2);
                }

            }
        }

        return result;
    }
}
