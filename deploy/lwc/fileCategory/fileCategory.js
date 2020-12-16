import { api, LightningElement } from 'lwc';

export default class FileCategory extends LightningElement {

    @api file
    @api categories

    @api
    get documentId(){
        return this.file.documentId
    }

    @api
    get category(){
        return this.value
    }

    handleChange(event) {
        this.value = event.detail.value
    }
}