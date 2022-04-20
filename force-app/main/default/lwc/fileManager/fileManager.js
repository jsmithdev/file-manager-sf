import { api, LightningElement, wire, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { 
    getObjectInfo,
    getPicklistValues, 
} from 'lightning/uiObjectInfoApi'

import {
    fieldMap,
    sortData,
    filterData,
    getColumns,
} from './util'

import objectApiName from '@salesforce/schema/ContentVersion'
import fieldApiName from '@salesforce/schema/ContentVersion.Category__c'
import getDocumentMetadata from '@salesforce/apex/FileManager.getDocumentMetadata'
import updateCategory from '@salesforce/apex/FileManager.updateCategory'
import deleteDocument from '@salesforce/apex/FileManager.deleteDocument'
import updateVersions from '@salesforce/apex/FileManager.updateVersions'

export default class FileManager extends LightningElement {

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

    get filterCategories(){ return [{label: '(No Filter)', value: undefined, key: 'noFilterZero'}, ...this.categories] }
    get categories(){

        return this.picklist.data === undefined
            ? []
            : this.picklist.data.values.map(v => ({ label: v.label, value: v.value }))
    }

    get recordTypeId (){
        return this.object.data ? this.object.data.defaultRecordTypeId : undefined
    }

    get columns(){
        return getColumns({
            fields: this.fields,
            categories: this.categories,
        })
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

    @wire(getObjectInfo, { objectApiName })
    object;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName  })
    picklist;

    connectedCallback(){
        this.refreshExistingFiles()
    }

    async refreshExistingFiles(){

        const json = await getDocumentMetadata({ recordId:this.recordId })
    
        this.existing_files = fieldMap( json )

        this.viewable_files
    }
    
    handleUploadFinished(event){

        const { files } = event.detail

        this.files = files

        this.template.querySelector('c-modal')?.open()
    }

    async handleCategoryFinished(event){

        this.template.querySelector('c-modal')?.close()
        
        const { detail } = event

        //console.log('Logic layer has detail')
        //console.log(JSON.parse(JSON.stringify({detail})))

        for(const int in detail){

            const { 
                documentId,
                category 
            } = detail[int]

            //console.log(documentId)
            //console.log(category)
    
            const result = await updateCategory({documentId, category})
            //console.log(result)
        }
        
        this.refreshExistingFiles()
    }

    managerChanged(event){
        
        const { 
            row,
            action,
        } = event.detail

        //console.log({row,action,})

        if(action.name === 'download'){
            window.open(row.download_link, '_target')
        }
        if(action.name === 'detail'){
            window.open(row.detail_link, '_target')
        }
        if(action.name === 'delete'){
            this.deleteDocument( row.ContentDocumentId )
        }
        
        //console.log(JSON.parse(JSON.stringify({
        //    existing_files: this.existing_files,
        //    eventdetail: event.detail,
        //})))
    }

    handleSave(event){
        
        try {
                
            const versions = event.detail.draftValues

            this.updateVersions(versions)
        }
        catch (error) {
            this.error(error.message)
        }
    }
    
    async updateVersions( versions ) {

        try {
            
            const result = await updateVersions({ versions })

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
                Category__c: value,
            }]

            const result = await updateVersions({ versions })
            
            //console.log(result)
            
            this.refreshExistingFiles()

            //this.toast(result, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
    }

    async deleteDocument( documentId ) {

        try {
            
            const result = await deleteDocument({ documentId })

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
}
/* 
debug(){
    
    this.template.querySelector('c-modal').open()
    
    console.log({
        this: this,
        files: this.files,
        categories: this.categories,
        existing_files: this.existing_files,
    })
}
*/