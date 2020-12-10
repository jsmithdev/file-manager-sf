# file-manager (Salesforce Files)

Categorize, filter, view, download &amp; upload Salesforce files

![screenshot](https://i.imgur.com/5wVISQC.png)

## Notes

Use the App or Community Builder to place component labeled File Manager

- There are fields you can edit like header, icon and fields

ContentVersion will contain a field to categorize files ( _ContentVersion.Category__c_ )

- permissions for field, etc would need to be configured

## Deploy

Covert with SFDX; This creates a folder called `deploy`

```bash
sfdx force:source:convert -r force-app -d deploy
```

Now you can deploy from the resulting `deploy` directory

```bash
sfdx force:mdapi:deploy -d deploy -w -1  --verbose
```

📌  Above deploys to the default org set

- Add `-u user@domain.com` or `-u alias` to deploy else where
- To run tests add `-l RunSpecifiedTests -r ApexTestName`

Results should more or less mirror below

```bash
Using specified username me@jsmith.dev

Job ID | 0Af1U000015XR14SAG
MDAPI PROGRESS | ████████████████████████████████████████ | 10/10 Components
jamie@the-brain:~/repo/sf-file-manager$ 
TYPE                      FILE                                  NAME                        ID
────────────────────────  ────────────────────────────────────  ──────────────────────────  ──────────────────
                          deploy/package.xml                    package.xml
ApexClass                 deploy/classes/FileManager.cls        FileManager                 01p1U00000QWibCQAT
ApexClass                 deploy/classes/UploadCategories.cls   UploadCategories            01p1U00000QWibDQAT
CustomField               deploy/objects/ContentVersion.object  ContentVersion.Category__c  00N1U00000ViDR6UAN
CustomObject              deploy/objects/ContentVersion.object  ContentVersion
LightningComponentBundle  deploy/lwc/carouselCategories         carouselCategories          0Rb1U000000PKp8SAG
LightningComponentBundle  deploy/lwc/datatablePicklist          datatablePicklist           0Rb1U000000PKp9SAG
LightningComponentBundle  deploy/lwc/extendaTable               extendaTable                0Rb1U000000PKpASAW
LightningComponentBundle  deploy/lwc/fileCategory               fileCategory                0Rb1U000000PKpBSAW
LightningComponentBundle  deploy/lwc/fileManager                fileManager                 0Rb1U000000PKpCSAW
LightningComponentBundle  deploy/lwc/modal                      modal                       0Rb1U000000XjWiSAK

```
