import { api, track, LightningElement } from 'lwc';

export default class CoastalFilesModal extends LightningElement {
    
    @track file
    @track active = false;
    @track fileUrl = false;
    
    @track video
    @track image
    @track doc

    @api 
    get selected(){
        return this.file
    }
    set selected(file){
            
        if(file){

            this.video = 'video' === file.type
            
            this.image = 'image' === file.type
            
            this.doc = 'file' === file.type

            this.fileUrl = file.url

            this.file = file
            
            this.open()
        }
    }

    open() {
        this.active = true
    }
    close() {
        
        this.active = false

        delete this.video
        delete this.image
        delete this.doc
        delete this.fileUrl
        delete this.file
        delete this.fileUrl
    }

    view() {

        //if('file' === t || 'image' === t){
            window.open(this.file.url, '_blank')
        //}
    }
    remove() {

        const data = { detail: this.file }
        // eslint-disable-next-line no-alert
        if(confirm(`Delete ${data.detail.name}?`)){

            this.dispatchEvent(new CustomEvent('remove', data))
            this.close()
        }
    }
}