# File Manager (Salesforce)

## Categorize, filter, view, download &amp; upload related files in Salesforce

![full screenshot](https://i.imgur.com/5wVISQC.png)

### Other Modes

![upload only screenshot](https://i.imgur.com/sMG6o1J.png)
> Above is an example of Upload Only mode

## Notes

Use the App or Community Builder to place component labeled File Manager

Deploying adds a field to ContentVersion (Category__c) used for categorization of files

- permissions for the custom field may need to be configured

## Settings

![settings screenshot](https://i.imgur.com/Hx1mhgn.png)

File Manger has the following settings (in the App or Community Builder sidebar):

Header: The main header text

- Default: File Manager

Sub-header: Additional text useful when using Upload Only
  
- Default: blank

Icon Name: any icon name from [SLDS](https://www.lightningdesignsystem.com/icons/)
  
- Default: action:manage_perm_sets

Fields: fields to display in the table (from ContentVersion sObject)

- Default: Title, Category__c, Owner, LastModifiedDate

Upload Only: If true, does not render table or prompt for categorization on upload

- Default: false

## Deploy

SFDX: [sfdx deploy instructions](https://github.com/jsmithdev/sfdx-deploy-instructions)

Click deploy available @ <https://component.land?share=jsmithdev%2Ffile-manager-sf>

---

authored with 💖 by [Jamie Smith](https://jsmith.dev)
