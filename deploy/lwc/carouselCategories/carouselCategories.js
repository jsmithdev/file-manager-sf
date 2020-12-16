import { api, LightningElement } from 'lwc';

export default class CarouselCategories extends LightningElement {

    @api files = []
    @api categories = []

    get indicators(){
        return Array.from(Array(this.files.length).keys()).map(index => {
            return {
                index,
                key: `panel_${index}_indicator`,
                classes: `panel_${index}_indicator slds-carousel__indicator`
            }
        })
    }
    get category(){
        return this._category
    }
    set category(value){
        console.log('cate set: '+value)
        this._category = value
    }

    get value(){
        return this.data
    }
    get max(){ return this.files.length }

    get count(){
        return `${this.active+1} of ${this.max}`
    }
    get button_label(){
        return (this.active + 1) === this.max
            ? 'Save'
            : 'Next'
    }

    get container(){ return this.template.querySelector('.slds-carousel__panels') }
    get panels(){ return this.template.querySelectorAll('.slds-carousel__panel') }
    get selects(){ return this.template.querySelectorAll('select') }

    active = 0
    previous(){
        
        if(this.active - 1 < 0){ return console.log('at start') }
        
        this.active--

        this.switchPanels()
    }

    switchPanels(){

        this.panels.forEach(el => {
        
            if(el.classList.contains(`panel_${this.active}`)){
                el.classList.add('active')
                el.classList.remove('hidden')
            }
            else {
                el.classList.remove('active')
                el.classList.add('hidden')
            }
        })
    }
    
    next(){
        if(this.active + 1 === this.max){ 

            const detail = this.getDetails()
            console.log('this.getDetails()')
            console.log(detail)
            return this.dispatchEvent(new CustomEvent('save', { detail }))
        }
        this.active++
        this.switchPanels()
    }
    activate(el){ 
        el.classList.add('active')
        el.classList.remove('hidden')
    }
    deactivate(el){ 
        el.classList.remove('active')
        el.classList.add('hidden')
    }
    

    getDetails(){
        return Array.from(this.selects).map(el => {
            return {
                documentId: el.name,
                category: el.value,
            }
        })
    }

    renderedCallback(){

        if(this.init){ return console.log('has ran')}
        
        this.files.map((file, index) => {

            const div = document.createElement('div')
            div.classList.add(`slds-carousel__panel`, `panel_${index}`)

            if(index === 0){
                this.activate(div)
            }
            else {
                this.deactivate(div)
            }

            const p = document.createElement('p')
            p.textContent = file.name
            p.classList.add('title')
            div.appendChild( p )

            //const sel = document.createElement('lightning-combobox')
            //sel.options = this.categories
            //sel.classList.add('title')
            //sel.placeholder = "Pick a Category"
            //sel.label = "What category would this file belong to?"
            //sel.onchange = event => this.category = event.target.value
            //div.appendChild( sel )
            const sel = document.createElement('select')
            sel.classList.add('slds-select')
            sel.name = file.documentId

            this.categories.map(c => {
                const opt = document.createElement('option')
                opt.value = c.value
                opt.textContent = c.label
                sel.appendChild(opt)
            })
            div.appendChild( sel )

            this.container.appendChild( div )

            this.init = true
        })
    }
}


/**
 * slot = content
 * - will need to include panels
 
 <div name="panel_0" class="slds-carousel__panel">
    whatever markup wanted...
 </div>

 * will need num_of_items for indicators
 * 
 * for indicator swap use 
 * - search all li
 * -- make panel_0_indicator 
 * 
 */
