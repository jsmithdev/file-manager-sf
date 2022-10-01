import { api, LightningElement, wire, track } from 'lwc';

import { loadScript } from 'lightning/platformResourceLoader';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//import AWS_SDK from '@salesforce/resourceUrl/AWS_MIN';
//import getCreds from '@salesforce/apex/Cloud_Storage.getCreds'
import userId from '@salesforce/user/Id';

import lsAws from '@salesforce/apex/c/fileManager.lsAws'
import getAwsSignedURL from '@salesforce/apex/c/fileManager.getAwsSignedURL'

import {
    fieldMap,
    sortData,
    filterData,
    getColumns,
} from './util';


export default class FileManagerAws extends LightningElement {

    @api isUploadOnly = false;
    @api subheader = '';

    all_files = []

    @api header = ''
    @api iconName = 'action:manage_perm_sets'
    @api fields = []
    @api recordId = ''

    @track files = []
    @track sortedBy = 'LastModifiedDate'
    @track sortedDirection = 'desc'
    @track viewable_files = []

    //renderedCallback(){ this.debug() }

    get existing_files(){
        return this.all_files
    }
    set existing_files(files){
        this.viewable_files = files
        this.all_files = files
    }

    get columns(){
        return getColumns()
    }

    get mappedFields(){ return this.fields.split(',').map(f => {
        if(f === 'LastModifiedDate'){
            return 'modDate'
        }
        else if(f === 'Owner'){
            return 'owner'
        }
        else {
            return f
        }
    })}


    async renderedCallback() { // invoke the method when component rendered or loaded
        
        if(!this.init){
            this.init = true
            
            try {
                await loadScript(this, AWS_SDK + '/AWS_MIN.js')
                    
                // eslint-disable-next-line no-undef
                this.AWS = AWS;

                console.log('AWS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
                console.log(AWS)

                this.initializeAWS()
            }
            catch(error){
                console.warn(error)
                this.error(error.message)
            }
        }
    }
    
    async initializeAWS(){

        try {
            
            const creds = await getCreds()
            // eslint-disable-next-line no-console
            console.log(`Using ${this.recordId ? 'record' : 'user'}`)
            console.log('creds', creds)

            this.Prefix = this.recordId ? this.recordId : userId //0031U00000JajaxQAB

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

            this.refreshExistingFiles()

        }
        catch (error) {
            console.error( error )
        }
    }

    

    refreshExistingFiles() {

        if(!this.params.Prefix){
            return console.warn('File Manager: No Prefix for AWS')
        }

        const bucket = new this.AWS.S3() //{ params: this.params }

        bucket.listObjects(this.params, (error, response) => {

            console.log('refreshFiles >>>>>>>>>>>>>>>>>>>>>>>>>>>> ')
            console.log(response?.Contents)

            //if(!response){ return }
            if(error){ console.error(error); }
            
            const files = response.Contents
                .filter(file => file.Size)
                .map(file => fieldMap(file))

            console.log('refreshFiles files =>')
            console.log(files)

            this.existing_files = files;
                
            const sorted = sortData(
                files, 
                this.sortedBy, 
                this.sortedDirection
            );
            console.log('refreshFiles files sorted =>')
            console.log(sorted)

            this.viewable_files = sorted;
            //this.dispatchEvent(new CustomEvent('files', { detail: files } ))
        })
    }


    async handleUpload(event){
        console.log('handleUpload event =>')
        console.log(event)
        const files = event.detail.files
        const results = await this.uploadFiles([...files])
        console.log('handleUpload results =>')
        console.log(results)

        this.refreshExistingFiles()
    }

    uploadFiles(files){
        console.log('uploadFiles files =>')
        console.log(files)
        return Promise.all(files.map(file => this.uploadFile(file)))
    }

    async uploadFile(file){

        console.log('uploadFile file =>')
        console.log(file)

        const Key = `${this.Prefix}/${file.name}`
        //const Key = `${this.Prefix}/${data.name}`
        const params = {
            Bucket: this.Bucket,
            Key,
            ContentType: file.type,
            Body: file,
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
    
    handleUploadFinished(event){

        const { files } = event.detail

        this.files = files
    }

    managerChanged(event){
        
        const { 
            row,
            action,
        } = event.detail

        console.log(JSON.stringify({row,action,}))

        if(action.name === 'download'){
            //window.open(row.download_link, '_target')
            this.downloadFile(row)
        }
        if(action.name === 'preview'){
            this.previewFile(row)
        }
        if(action.name === 'delete'){
            this.deleteDocument( row.Key )
        }
        
        //console.log(JSON.parse(JSON.stringify({
        //    existing_files: this.existing_files,
        //    eventdetail: event.detail,
        //})))
    }

    downloadFile(file){
        console.log('downloadFile file =>')
        console.log(file)
        const bucket = new this.AWS.S3() //{ params: this.params }
        const params = {
            Bucket: this.Bucket,
            Key: file.Key,
        }
        console.log(params)
        bucket.getObject(params, (error, data) => {
            if(error){
                console.error(error)
                return
            }
            console.log(data)
            const blob = new Blob([data.Body], { type: data.ContentType })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = file.Title
            a.click()
        })
    }

    previewFile(file){
        console.log('previewFile file =>')
        console.log(file)
        const bucket = new this.AWS.S3() //{ params: this.params }
        const params = {
            Bucket: this.Bucket,
            Key: file.Key,
        }
        console.log(params)
        bucket.getObject(params, (error, data) => {
            if(error){
                console.error(error)
                return
            }
            console.log(data)
            const blob = new Blob([data.Body], { type: data.ContentType })
            const url = window.URL.createObjectURL(blob)

            this.template.querySelector('c-file-manager-preview').open(file.Title, url)
        })
    }

    handleSave(event){
        
        try {
                
            const versions = event.detail.draftValues

            console.log('versions', versions)

        }
        catch (error) {
            this.error(error.message)
        }
    }
    
    async updateVersions( versions ) {

        try {
            
            console.log('versions', versions)

            this.refreshExistingFiles()

            this.toast(result, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
    }

    async updateCategory( event ) {

        try {

            const {
                type,
                value,
                context,
            } = event.detail
            
            const versions = [{
                Id: context,
            }]

            
            console.log('versions', versions)
            
            this.refreshExistingFiles()

            //this.toast(result, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
    }

    async deleteDocument( documentId ) {

        try {
            
            console.log('delete documentId', documentId)

            this.refreshExistingFiles()

            this.toast(result, 'Success', 'success')

        }
        catch (error) {
            this.error(error.message)
        }
    }


    updateColumnSorting(event) {
        
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;

        this.viewable_files = sortData(
            this.viewable_files, 
            this.sortedBy, 
            this.sortedDirection
        );
    }

    filterData(event) {

        const {
            name,
            value
        } = event.target;

        //console.log('name, value =>');
        //console.log(name, value);

        if(name === 'Category__c') { this._currentCate = value }
        if(name === 'Any') { this._currentAny = value }

        if(!value && name === 'Any' && this._currentCate){

            this._currentAny = undefined;
            this.viewable_files = filterData(this.existing_files, ['Category__c'], this._currentCate);
        }
        else if(!value && name === 'Category__c' && this._currentAny){

            this._currentCate = undefined;
            this.viewable_files = filterData(this.existing_files, this.mappedFields, this._currentAny);
        }
        else if(name === 'Any' && this._currentCate){

            const possibles = filterData(this.existing_files, ['Category__c'], this._currentCate);
            this.viewable_files = filterData(possibles, this.mappedFields, this._currentAny);
        }
        else if(!value){

            this.viewable_files = this.existing_files;
        }
        else {

            const fields = name === 'Any' ?  this.mappedFields : [name];
            
            this.viewable_files = filterData(this.existing_files, fields, value);
        }
    }

    error(message){
        this.toast(message, 'Error', 'error')
    }

    toast( message = '', title = 'Info', variant = 'info') {
        
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        })

        this.dispatchEvent(event)
    }
    
    debug(){

        this.template.querySelector('c-file-manager-preview').open('')
    
        console.log({
            existing_files: this.existing_files,
        })
    }
}
/* 

*/