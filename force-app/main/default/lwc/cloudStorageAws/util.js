/**
* @param {Object} file info from aws response
*/
export function fileWrap(file) {

    const key = file.Key
    
    return {

        region: file.region,
        bucket: file.bucket,

        path: key,
        ext: key.substring(key.lastIndexOf('.') +1, key.length),
        name: key.substring(key.lastIndexOf('/')+1, key.lastIndexOf('.')),

        salesforceId: file.recordId,
        
        uid: file.ETag,
        moddate: file.LastModified,
        owner: file.Owner,
        size: file.Size,

        get url () {
            return `https://s3.${this.region}.amazonaws.com/${this.bucket}/${key}`
        },

        get type () {
            
            return ['WEBM', 'MPG', 'MP2','MPEG', 'MPE', 'MP4', 'M4V', 'M4P', 'OGG', 'MPV'].includes(this.ext.toUpperCase())
                ? 'video'
                : ['JPEG', 'JPG', 'GIF', 'PNG', 'APNG', 'BMP'].includes(this.ext.toUpperCase())
                    ? 'image'
                    : 'file'
        }
    }
}
    
/**
 * @fileWrap map 
    Coming
        ETag: ""4b41a3475132bd861b30a878e30aa56a""
        Key: "0031U00000JajaxQAB/view2.pdf"
        LastModified: Wed May 15 2019 02:40:55 GMT-0400 (Eastern Daylight Time) {}
        Owner: {ID: "ed790e5914202d7acf19e8019798273ef1768e8ed3fde438f82aed1fa0a91351"}
        Size: 3028
        StorageClass: "STANDARD"
    Going
        uid: ETag
        name: end of key
        salesforceId: uid
        path: key
        moddate: LastModified
        owner: Owner
        size: Size
*/