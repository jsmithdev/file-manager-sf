/**
 * return array of pre mapped rows
 * @param {Array} files 
 */
export function fieldMap(files){

    return files.map(file => {

        const object = Object.assign({}, file)

        object.owner = object.Owner.Name
        object.detail_link = `/lightning/r/ContentDocument/${file.ContentDocumentId}/view`
        object.download_link = `/sfc/servlet.shepherd/version/download/${file.Id}`

        object.modDate = new Date(object.LastModifiedDate).toLocaleString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true 
        })

        //console.log(JSON.parse(JSON.stringify({ object })))
        
        return object
    })
}

/**
 * return columns as requested by options
 * @param {Object} options 
 *   categories: Array
 *   fields: String comma separated
 */
export function getColumns(options){

    //console.log('column options')
    //console.log(options)

    const {
        categories,
    } = options;

    const fields = [
        ...options.fields.replace(/ /g, '').split(','),
        'Actions',
    ]
    
    const columns = fields.reduce((cols, field) => [
        ...cols, 
        columnMap(categories)[field]
    ], []);
    
    //console.log('columns')
    //console.log(columns)

    return columns
}

function columnMap(categories){

    return {
    
        'Title': {
            label: 'Title',
            fieldName: 'Title',
            type: 'text',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },
        

        'Category__c': {
            label: 'Category', 
            fieldName: 'Category__c', 
            type: 'picklist', 
            sortable: true,
            hideDefaultActions: true,
            typeAttributes: {
                placeholder: 'Choose Category', 
                options: categories, 
                value: { 
                    fieldName: 'Category__c'
                }, 
                context: { 
                    fieldName: 'Id' 
                }
            }
        },

        'Owner': {
            label: 'Owner',
            fieldName: 'owner',
            type: 'text',
            sortable: true,
            editable: false,
            hideDefaultActions: true,
        },

        'LastModifiedDate': {
            label: 'Modified',
            fieldName: 'modDate',
            type: 'date',
            sortable: true,
            hideDefaultActions: true,
            typeAttributes:{
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            },
        },
        
        'Actions': {
            //label: 'Actions',
            type: 'action',
            typeAttributes: { 
                fieldName: "rowActions",
                rowActions: [
                    {
                        label: 'Details',  //Required. The label that's displayed for the action
                        name: 'detail',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
                    },
                    {
                        label: 'Download',  //Required. The label that's displayed for the action
                        name: 'download',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:download', //The name of the icon to be displayed to the right of the action item.
                        iconPosition: 'left',
                    },
                    {
                        label: 'Delete',  //Required. The label that's displayed for the action
                        name: 'delete',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:delete', //The name of the icon to be displayed to the right of the action item.
                        iconPosition: 'left',
                    },
                ], 
                menuAlignment: 'auto',
            } 
        },
    }
}

/**
 * Sort records via given parameters
 * @param {Array} records array of records to sort ([])
 * @param {String} fieldName name of field to sort by (Title)
 * @param {String} sortDirection direction to sort by (asc|desc)
 * @returns {Array} sorted array
 */
export function sortData(records, fieldName, sortDirection) {

    //console.log(fieldName)

    const text_fields = ['Category__c', 'Title', 'owner']
    const date_fields = ['modDate']

    if(text_fields.includes(fieldName)) {

        if(sortDirection === "desc") {
            return records.sort((a,b) => 
                b[fieldName].toUpperCase() < a[fieldName].toUpperCase() 
                    ? -1
                    : b[fieldName].toUpperCase() > a[fieldName].toUpperCase() 
                        ? 1
                        : 0 //equal
            );
        }
        else if(sortDirection === "asc") {
            return records.sort((a,b) => 
                a[fieldName].toUpperCase() < b[fieldName].toUpperCase() 
                    ? -1
                    : a[fieldName].toUpperCase() > b[fieldName].toUpperCase() 
                        ? 1
                        : 0 //equal
            );
        }
    }
    else if(date_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {
            return records.sort((a,b) => new Date(b.LastModifiedDate).getTime() - new Date(a.LastModifiedDate).getTime())
        }
        else if(sortDirection === "asc") {
            return records.sort((a,b) => new Date(a.LastModifiedDate).getTime() - new Date(b.LastModifiedDate).getTime())
        }
    }

    return records
}



/**
 * Filter records via given parameters
 * @param {Array} records array of records to filter ([{},{}])
 * @param {Array} props array of properties to filter on [Title,Category__c]
 * @param {String} value value to filter by
 * @returns {Array} filtered array
 */
export function filterData(records, props, value) {

	return records.filter(record => {
		return props.some(field => {
			return String(record[field]).toLocaleLowerCase().includes(value.toLocaleLowerCase())
		})
	})
}
