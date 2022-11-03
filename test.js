const xml = `<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>jsmithdev</Name><Prefix>0051U000005O0HBQA0</Prefix><Marker></Marker><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated><Contents><Key>0051U000005O0HBQA0/1.3.6.1.4.1.41327.1394067840121.303216832227429629.dcm</Key><LastModified>2022-09-28T16:37:48.000Z</LastModified><ETag>&quot;fd0752a898016d2e246333a2d114ba94&quot;</ETag><Size>193084</Size><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>0051U000005O0HBQA0/CC189E09-94CB-4950-BE12-788DC384DE1B.jpeg</Key><LastModified>2022-09-28T05:34:31.000Z</LastModified><ETag>&quot;7f0c36257c70e2a497909337bb94a850&quot;</ETag><Size>1268382</Size><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>0051U000005O0HBQA0/Document (Powerpoint).pptx</Key><LastModified>2022-09-28T16:37:47.000Z</LastModified><ETag>&quot;72eb83c3ba86db524787ede2f00994ee&quot;</ETag><Size>57947</Size><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>0051U000005O0HBQA0/Preview SDK Sample Excel.xlsx</Key><LastModified>2022-09-28T16:42:16.000Z</LastModified><ETag>&quot;2144cb2ec4ebbc8cd508d8cf02c04bd2&quot;</ETag><Size>83418</Size><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>0051U000005O0HBQA0/Sample4.txt</Key><LastModified>2022-09-28T16:37:48.000Z</LastModified><ETag>&quot;f6ffbacf93e5fab6bc961ffb3efc1514&quot;</ETag><Size>27</Size><StorageClass>STANDARD</StorageClass></Contents><Contents><Key>0051U000005O0HBQA0/test.jpg</Key><LastModified>2022-09-28T00:56:19.000Z</LastModified><ETag>&quot;c237037bc2377967d17f9fff5f1649fe&quot;</ETag><Size>312726</Size><StorageClass>STANDARD</StorageClass></Contents></ListBucketResult>`;

const parser = new DOMParser();
const doc = parser.parseFromString(xml, "application/xml");
const contents = doc.getElementsByTagName("Contents");
const keys = [];
for (let i = 0; i < contents.length; i++) {
    keys.push(contents[i].getElementsByTagName("Key")[0].textContent);
    }
console.log(keys);

