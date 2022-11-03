import { api, LightningElement } from 'lwc';

export default class FileManagerPreview extends LightningElement {
    
    active = false;
    previewUrl = '';

    @api open(name, url) {
        console.log('open =>')
        console.log(url)
        this.name = name;
        this.previewUrl = url;
        this.active = true
    }
    @api close() {
        this.name = '';
        this.previewUrl = '';
        this.active = false
    }

    resizeIframe(event) {
        console.log('resizeIframe =>')
        const iframe = this.template.querySelector('iframe')
        console.log(iframe)
        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px'
    }
}