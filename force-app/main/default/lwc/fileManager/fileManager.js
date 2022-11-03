import { api, LightningElement } from 'lwc';



export default class FileManager extends LightningElement {

    @api provider = ''
    @api header = ''
    @api subheader = '';
    @api iconName = 'action:manage_perm_sets'
    @api fields = []
    @api recordId = ''
    @api isUploadOnly = false;
    @api prefix = '';

    get isSalesforce(){
        return this.provider === 'Salesforce';
    }

    get isAWS(){
        return this.provider === 'AWS-S3';
    }

    get awsPrefix(){
        return this.recordId ? this.recordId : this.prefix;
    }

    connectedCallback(){
        this.debug()
    }

    renderedCallback(){
        this.debug()
    }

    debug(){
        console.log('FileManager: ', {
            provider: this.provider, 
            header: this.header, 
            subheader: this.subheader, 
            iconName: this.iconName, 
            fields: this.fields, 
            recordId: this.recordId, 
            isUploadOnly: this.isUploadOnly,
            isSalesforce: this.isSalesforce,
            isAWS: this.isAWS,
        })
    }
}