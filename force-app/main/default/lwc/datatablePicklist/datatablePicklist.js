import { LightningElement, api } from 'lwc'

export default class DatatablePicklist extends LightningElement {

    @api label
    @api placeholder
    @api options
    @api value
    @api context

    renderedCallback(){
        if((this.value && this.context) && !this.init){
            this.init = true
            this.template.querySelector('select').context = this.context
            this.template.querySelector('select').value = this.value
        }
    }

    custom__handleChange(event) {

        const {
            value,
            context,
        } = event.target;

        const detail = {
            type: 'picklist-change',
            value,
            context,
        }
        
        console.log(JSON.parse(JSON.stringify( detail )))
        
        this.dispatchEvent(new CustomEvent('picklist', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail
        }))
    }
}