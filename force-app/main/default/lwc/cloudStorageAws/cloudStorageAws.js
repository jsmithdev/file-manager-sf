import { api, LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import AWS_SDK from '@salesforce/resourceUrl/AWS_MIN';

import getCreds from '@salesforce/apex/Cloud_Storage.getCreds'
import userId from '@salesforce/user/Id';

export default class CloudStorageAws extends LightningElement {

    @api record;
    @api recordId;

    @track data;
    @track error;
    @track progress;

    @api
    get file () { return '' }
    set file (file){

        if(!file){ return }        
        this.handleFiles( file )
    }

    @api 
    get download(){}
    set download(file){
        console.log('downloadFile =>')
        console.log(file)
        if( file ){ this.downloadFile(file) }
    }

    
    async handleFiles(files){
        console.dir(files)
        try {
            
            const results = await Promise.all( Array.from(files).map(async file => await this.uploadFile( file )))
            console.log('results =>')
            console.log(results)
            
            const opts = { 
                title: `Success`,
                message: `${files.length} uploaded, refreshing...`,
                variant: 'success'
            }

            this.dispatchEvent( new ShowToastEvent(opts) )

            const refresh = () => this.refreshFiles()
            setTimeout(refresh, 3000)
        }
        catch(error){
            
            const opts = { 
                title: `Upload Error`,
                message: `${error.message}`,
                variant: 'error'
            }

            this.dispatchEvent( new ShowToastEvent(opts) )
        }
    }


    async uploadFile(data){

        const Key = `${this.Prefix}/${data.name}`
        //const Key = `${this.Prefix}/${data.name}`
        const params = {
            Bucket: this.Bucket,
            Key,
            ContentType: data.type,
            Body: data,
            ACL: 'public-read' // set based on AWS S3
        }
        console.log(Key)
        console.log(params)
        
        const opts = {
            queueSize: 1,
            partSize: 1024 * 1024 * 10
        }

        const bucket = new this.AWS.S3() //{ params: this.params }


        return new Promise((resolve, reject) => {

            try {
                bucket.upload(params, opts,  (error) => {
                    
                    if(error){
                        // eslint-disable-next-line no-console
                        console.error(error)
                        return reject(error)
                    }
                    resolve(this.progress)
                })
                .on('httpUploadProgress', num => {
    
                    this.progress = Math.round(num.loaded / num.total * 100)
    
                    if(this.progress === 100){

                        this.progress = 0
                        resolve(this.progress)
                    }
                })
            }
            catch(error){
                // eslint-disable-next-line no-console
                console.error( error )
                reject( error )
            }
        })
    }

    @api
    get removefile () { return '' }
    set removefile (file){
        if(!file){ return }

        const Key = file.path
            , Bucket = this.Bucket
            , params = {
                Key,
                Bucket
            }
        ;

        const bucket = new this.AWS.S3() //{ params }
        
        bucket.deleteObject(params, (error) => {
            if(error){
                // eslint-disable-next-line no-console
                console.error(error)
            }
            this.refreshFiles()
        })
    }

    renderedCallback() { // invoke the method when component rendered or loaded
        
        if(!this.init){
            this.init = true
            Promise.all([
                loadScript(this, AWS_SDK + '/AWS_MIN.js'),
            ])
            .then(() => { 
                this.error = undefined; // scripts loaded successfully
            
                // eslint-disable-next-line no-undef
                this.AWS = AWS

                this.initializeAWS();
            })
            .catch(console.error)
        }
    }
    
    async initializeAWS(){

        try {
            
            const creds = await getCreds()
            // eslint-disable-next-line no-console
            console.log(`Using ${this.record ? 'record' : 'user'}`)

            this.Prefix = this.record ? this.record : userId //0031U00000JajaxQAB

            this.Region = creds.Region__c
            this.Bucket = creds.Bucket__c
            
            this.AWS.config.httpOptions = { timeout: 6000000 }

            this.AWS.config.region = this.Region
            
            // If chose to use API key instead of IdentityPoolId
            this.AWS.config.credentials = new this.AWS.Credentials(creds.AccessKeyId__c, creds.SecretAccessKey__c)
            
            // If choose to use IdentityPoolId instead of API key
            //this.AWS.config.credentials = new this.AWS.CognitoIdentityCredentials({ IdentityPoolId: creds.IdentityPoolId__c })

            // eslint-disable-next-line no-confusing-arrow, no-console
            const test = await this.AWS.config.credentials.getPromise()
            
            this.params = { Bucket: this.Bucket, Prefix: this.Prefix }
            console.log(this.params)

            this.refreshFiles()

        }
        catch (error) {
            console.error( error )
        }
    }

    refreshFiles() {

        const region = this.Region
        const bucketName = this.Bucket

        const bucket = new this.AWS.S3() //{ params: this.params }
        
        
        bucket.listObjects(this.params, (error, response) => {

            if(!response){ return }
            if(error){ console.error(error); return }
            
            const files = response.Contents
                .map(file => { file.Region = region; file.Bucket = bucketName; return file; })
                .filter(file => file.Size)
                .map(file => new fileWrap(file))

            console.log('refreshFiles files =>')
            console.log(files)
            this.dispatchEvent(new CustomEvent('files', { detail: files } ))
        })
    }

    downloadFile(file) {
        console.log(file)

        const bucketName = this.Bucket

        const bucket = new this.AWS.S3() //{ params: this.params }
        
        bucket.getObject(
            { Bucket: bucketName, Key: file.path },
            function (error, data) {
              if (error != null) {
                console.error(error);
              } else {
                console.log("Loaded " + data.ContentLength + " bytes");
                // do something with data.Body
                console.log(data.Body)
                const blob = new Blob(data.Body, {type: 'application/octet-stream'});
                const blobUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement("a");
                downloadLink.setAttribute("type", "hidden");
                downloadLink.href = blobUrl;
                downloadLink.download = `${file.name}.${file.ext}`
                document.body.appendChild(downloadLink);
                downloadLink.click();
                downloadLink.remove();
              }
            }
        );
    }
}


function fileWrap(file) {

    const { 
        Key, 
        Region, 
        Bucket,
    } = file;
    
    return {

        Region, 
        Bucket,

        path: Key,
        ext: Key.substring(Key.lastIndexOf('.') +1, Key.length),
        name: Key.substring(Key.lastIndexOf('/')+1, Key.lastIndexOf('.')),

        salesforceId: file.recordId,
        
        uid: file.ETag,
        moddate: file.LastModified,
        owner: file.Owner,
        size: file.Size,

        get url () {
            return `https://s3.${this.Region}.amazonaws.com/${this.Bucket}/${Key}`
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