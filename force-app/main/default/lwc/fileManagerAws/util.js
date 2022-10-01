/**
 * return pre mapped row
 * @param {Object} file 
 */
export function fieldMap(file) {

    const Title = file.Key.substring(file.Key.lastIndexOf('/')+1, file.Key.lastIndexOf('.'))
    const Type = file.Key.substring(file.Key.lastIndexOf('.')+1, file.Key.length).toUpperCase()

    return {
        ...file,
        Title,
        Type,
    }
}

/**
 * return columns for datatable
 */
export function getColumns(){

    //console.log('column options')
    //console.log(options)

    return [
    
        // 'Title': 
        {
            label: 'Title',
            fieldName: 'Title',
            type: 'text',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },
    
        //'Type': 
        {
            label: 'Type',
            fieldName: 'Type',
            type: 'text',
            sortable: true,
            editable: true,
            hideDefaultActions: true,
        },

        //'LastModifiedDate': 
        {
            label: 'Last Modified',
            fieldName: 'LastModified',
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
        
        //'Actions': 
        {
            //label: 'Actions',
            type: 'action',
            typeAttributes: { 
                fieldName: "rowActions",
                rowActions: [
                    {
                        label: 'Preview',  //Required. The label that's displayed for the action
                        name: 'preview',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
                        iconPosition: 'left',
                    },
                    {
                        label: 'Download',  //Required. The label that's displayed for the action
                        name: 'download',   //Required. The name of the action, which identifies the selected action
                        iconName: 'utility:download', //The name of the icon to be displayed to the right of the action item.
                        iconPosition: 'left',
                    },
                    //{
                    //    label: 'Delete',  //Required. The label that's displayed for the action
                    //    name: 'delete',   //Required. The name of the action, which identifies the selected action
                    //    iconName: 'utility:delete', //The name of the icon to be displayed to the right of the action item.
                    //    iconPosition: 'left',
                    //},
                ], 
                menuAlignment: 'auto',
            } 
        },
    ];
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

    const text_fields = ['Title', 'Type']
    const date_fields = ['LastModified']

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
 * @param {Array} props array of properties to filter on [Title,Type]
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
