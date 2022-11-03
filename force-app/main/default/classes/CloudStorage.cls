public with sharing class CloudStorage {

	@AuraEnabled(cacheable=false)
	public static String caller(){
		
		String proxy = 'https://8ce76be2.ngrok.io';

		String uid = UserInfo.getUserId();

		try {
			
			String clearText = 'randiexxdxoæderxxxxxxxagÓÓdboya¿ndloxxxx^hfrxxxxxellyrubs=asda';
			String k = 'c7ab1c4a9dc7cb1b4a9dc7ab1b4a9d42';
			Blob key = Blob.valueOf(k);
			Blob cipherText = Crypto.encryptWithManagedIV('AES256', key, Blob.valueOf(clearText));
			String encodedCipherText = EncodingUtil.base64Encode(cipherText); 
			
			HttpRequest req = new HttpRequest();

			req.setMethod('POST');
			req.setHeader('jmesentfromapex', '1764');
			req.setHeader('content-type', 'application/json');
			req.setEndpoint(proxy+'/_apextoken/'+uid);// #todo get from metdata

			String json = '{' +
			' "data" : "'+ encodedCipherText +'" '+
			'}';

			req.setBody(json);

			Http http = new Http();
			HTTPResponse res = http.send(req);

			String answer = EncodingUtil.base64Encode(Blob.valueOf(res.getBody())); 

			return answer;
		}
		catch(Exception e){
			return e.getMessage();
		}
	}
	public String decryptEncryptedResponse(String data, String key) {

			Blob dataB = EncodingUtil.base64Decode(data);
			Blob keyB = EncodingUtil.ConvertFromHex(key);

			Blob decryptedData = Crypto.decryptWithManagedIV('AES128', keyB, dataB);

			return decryptedData.toString();
	}
}


//Blob test = EncodingUtil.base64Decode('g3n31s4g00db0y+1L/Dkz83Juw==');


/* 

String clearText = 'the quick brown fox jumps over the lazy dog';

//Blob cryptoKey = Crypto.generateAesKey(256);
Blob cryptoKey = Blob.valueOf('');

// Generate the data to be encrypted.
Blob data = Blob.valueOf('Test data to encrypted');
// Encrypt the data and have Salesforce.com generate the initialization vector
Blob encryptedData = Crypto.encryptWithManagedIV('AES256', cryptoKey, data);

Blob key = EncodingUtil.base64Decode('g3n31s4g00db0y+1L/Dkz83Juw==');
Blob cipherText = Crypto.encryptWithManagedIV('AES128', cryptoKey, Blob.valueOf(clearText));

String test = EncodingUtil.base64Encode(cipherText);
*/

/* 
Blob key = Crypto.generateAesKey(128);
Blob data = Blob.valueOf('Data to be encrypted');
Blob encrypted = Crypto.encryptWithManagedIV('AES128', key, data);

Blob decrypted = Crypto.decryptWithManagedIV('AES128', key, encrypted);
String decryptedString = decrypted.toString();
System.assertEquals('Data to be encrypted', decryptedString);

*/