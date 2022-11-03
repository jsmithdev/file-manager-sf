import { api, LightningElement, wire, track } from 'lwc';

import { loadScript } from 'lightning/platformResourceLoader';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//import AWS_SDK from '@salesforce/resourceUrl/AWS_MIN';
//import getCreds from '@salesforce/apex/Cloud_Storage.getCreds'
import userId from '@salesforce/user/Id';

import ls from '@salesforce/apex/FileManagerAws.ls'
import generateSignedURL from '@salesforce/apex/FileManagerAws.generateSignedURL'

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

    get mappedFields(){
        return this.fields.split(',').map(f => {
            if(f === 'LastModifiedDate'){
                return 'modDate'
            }
            else if(f === 'Owner'){
                return 'owner'
            }
            else {
                return f
            }
        })
    }


    async connectedCallback() {
        
        if(!this.init){
            this.init = true
            this.prefix = this.recordId ? this.recordId : userId;

            try {
                this.refreshExistingFiles()
            }
            catch(error){
                console.warn(error)
                this.error(error.message)
            }
        }
    }

    

    async refreshExistingFiles() {

        if(!this.prefix){
            return console.warn('File Manager: No Prefix for AWS')
        }

        //const path = this.prefix;
        const path = '0051U000005O0HBQA0';

        console.log('refreshFiles path =>')
        console.log(path)

        const res = await ls({
            path,
            expires: 60,
        })

        const files = res.filter(file => file.Size)
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


        const Key = `${this.prefix}/${file.name}`
        //const Key = `${this.Prefix}/${data.name}`

        console.log(Key)
        
        const signedUrl = await generateSignedURL({
            Key,
            Expires: 60,
            Method: 'PUT',
            Type: file.type,
        })

        console.log('uploadFile signedUrl =>')
        console.log(signedUrl)

        const res = await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        })

        console.log('uploadFile res =>')
        console.log(res)
        console.log(await res.text())
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

    async downloadFile(file){
        console.log('downloadFile file =>')
        console.log(JSON.parse(JSON.stringify(file)))

        const { Key } = file;
        
        const signedUrl = await generateSignedUrl({
            Key,
            Expires: 60,
            Method: 'GET',
            Type: file.type,
        })

        const data = await fetch(signedUrl);
        
        const blob = await data.blob();
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.Title
        a.click()
    }

    async previewFile(file){
        console.log('previewFile file (*type used) =>')
        console.log(file)
        const { Key } = file;
        
        const signedUrl = await generateSignedUrl({
            Key,
            Expires: 60,
            Method: 'GET',
            Type: file.type,
        })

        const data = await fetch(signedUrl);
        
        const blob = await data.blob();
        const url = window.URL.createObjectURL(blob)

        this.template.querySelector('c-file-manager-preview').open(file.Title, url)
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