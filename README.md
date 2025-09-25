# Migration of SAP HANA XS Classic To SAP HANA XS Advanced Using SAP HANA Application Migration Assistant

[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/xsc-xsa-migration)](https://api.reuse.software/info/github.com/SAP-samples/xsc-xsa-migration)

## Description
The SAP HANA Application Migration Assistant allows users to migrate SAP HANA XS Classic application which is packaged as a Delivery Unit or a Package to SAP HANA XS Advanced Model along with migration of the deprecated SAP XSJS library to SAP Async-XSJS library. 

## Introduction
SAP HANA Interactive Education or SHINE is a demo application that is packaged as [HCO_DEMOCONTENT](https://github.com/SAP-samples/hana-shine/releases/download/v2.5.0/HCO_DEMOCONTENT-1.205.0.tgz) Delivery Unit. It includes the following features: 
- **HDI Features:**
  - Table
  - HDBDD Views
  - Sequence
  - Calculation Views
  - Analytical Views
  - Attribute Views
  - Associations
  - Table Functions
  - Synonyms
  - Procedures
  - Spatial Features
  - Local Time Data Generation
  - Index
  - Structured Privilege
  - Analytical Privilege

HCO_DEMOCONTENT follows the XS Classic Programming Model(XSC) and uses SAP HANA on-premise for the database. This article describes the steps to be followed to migrate this Delivery Unit from XS Classic to the XS Advanced Programming Model using the SAP HANA Application Migration Assistant.

<p align="center">
<img src="images\SolutionDiagramNew.png">
</p>

## Requirements
- XS Classic on-premise database source system with the [HCO_DEMOCONTENT](https://github.com/SAP-samples/hana-shine/releases/download/v2.5.0/HCO_DEMOCONTENT-1.205.0.tgz) delivery unit.
- SAP Business Application Studio Subscription.
- SAP Cloud Connector must be installed and configured to the SAP BTP Account with both the source XS Classic and target XS Advanced database systems
- Set up the connection between your SAP Business Application Studio(BAS) and your on-premise SAP HANA Database bound to XS Advanced using the following [link](https://help.sap.com/docs/SAP_HANA_PLATFORM/cf8b4c5847374960a68b55cb86eae013/d1e4372023054dc8a92dac8118ee0088.html?state=DRAFT&version=2.0.08).
- The target instance of XS Advanced must be available if you need to deploy the migrated XS Advanced Application after migration.

## Where to Start
To successfully migrate the HCO_DEMOCONTENT sample delivery unit using the SAP HANA Application Migration Assistant, follow the steps below:

1. Install and Configure the SAP Cloud Connector.
2. Setup SAP BTP Destinations to connect to both the source and target database systems.
3. Create a SAP Business Application Studio Devspace with the SAP HANA Application Migration Assistant Extension installed.
4. Migrate using the SAP HANA Application Migration Assistant.

## Steps
## Step-1: Install and Configure the SAP Cloud Connector

1. Install the [SAP Cloud Connector](https://tools.hana.ondemand.com/#cloud) on your local system. For the installation and setup of the cloud connector, please refer to this [Documentation](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/installation?locale=en-US).  
  
2. After installing the cloud connector, you can access it by opening your web browser and going to `https://localhost:<port-no>/`. Use your credentials to log in.
   
3. Once you've successfully logged in, set up the following connection in the Cloud Connector.
   -  The connection should link to the subaccount with the source SAP HANA database(Neo or on-premise) containing the XS Classic Application. To establish this connection, click on the connector button in the left menu. 

   -  Now, enter the necessary details for your subaccount - this includes the Region, Subaccount ID, Display Name, Subaccount User, Password, and Location ID. After entering all the information, click on 'Save'.

<p align="center">
	<img src="images\destination1.png" width="600" height="400">
</p>

4. Select the subaccount where the source database is located, then add a service channel under 'on-prem to cloud' using the following details:  
	
   - **Type**: HANA Database
	
   - **HANA Instance Name**: < DB/Schema ID >
	
   - **Local Instance Number**: Input any two-digit number between 00 and 09. This number is used to compute the port number needed to access the SAP instance in the SAP Hana Cloud. The local port is calculated from the local instance number (3<n<15). For example, if the number is 7, then the local port would be 30715.
	
   - **Connections**: 1

<p align="center">
	<img src="images\destination2.png" width="600" height="400">
</p>

5. Connect SAP Cloud Connector to the target SAP HANA database which is used for XS Advanced application's database artifacts. The SAP Cloud Connector enables you to connect SAP BTP to XS Advanced and the underlying SAP HANA on-premise database, for more information on the setup required, follow [Connect SAP Business Application Studio to XS Advanced](https://help.sap.com/docs/SAP_HANA_PLATFORM/cf8b4c5847374960a68b55cb86eae013/d1e4372023054dc8a92dac8118ee0088.html?state=DRAFT&version=2.0.08).

6. In the SAP Business Technology Platform (BTP) Cloud Foundry account where the SAP Business Application Studio (BAS) subscription is created, select 'Cloud to On-Prem' and add a mapping with the following details:  
	
   - **Back-end Type**: SAP Hana  
	
   - **Protocol**: TCP  
	
   - **Internal Host**: localhost  
	
   - **Internal Port**: < portno > (The port number derived from your local instance number)  
	
   - **Virtual Host**: myvirtualhost  
	
   - **Virtual Port**: This should be the same as your internal port
	
   - **Principal Type**: None  
		
<p align="center">
	<img src="images\destination3.png" width="600" height="400">
</p>

 
## Step-2: Setup an SAP BTP Destination to connect to the source system

Destinations in the SAP BTP Cockpit must be defined to provide access to both the Source XS Classic database(Neo or On-premise) and target XS Advanced database.

1. To add the SAP BTP destination required to connect the SAP BTP cockpit to the source XS Classic SAP HANA database(Neo or On-premise), navigate to the SAP BTP Cloud Foundry subaccount and select 'Destination' under 'Connectivity' from the left menu pane. Create a new destination using the following details:
 
 - **Name**: < Destination name >
 - **Type**: HTTP
 - **URL**: `https://<virtual-host>:<virtual-port-no>/`
 - **ProxyType**: on-premise
 - **Authentication**: NoAuthentication
 - **Locationid**: Location id as mentioned in cloud connector

And the following additional properties: 
 - **HTML5.DynamicDestination** : true
 - **WebIDEEnabled** : true
 - **WebIDEUsage** : xs_hdb 
	
<p align="center">
	<img src="images\destination4.png" width="600" height="400">
</p>

2. Add the SAP BTP destination required to connect the SAP BTP Cockpit to the target XS advanced SAP HANA database also. To do that please refer to [Connect SAP Business Application Studio to XS Advanced](https://help.sap.com/docs/SAP_HANA_PLATFORM/cf8b4c5847374960a68b55cb86eae013/d1e4372023054dc8a92dac8118ee0088.html?state=DRAFT&version=2.0.08).

## Step-3: Create a SAP Business Application Studio Devspace with the SAP HANA Application Migration Assistant Extension installed  
	
1. In the sub-account where you created the destination, establish a subscription to SAP Business Application Studio (BAS).

2. Open SAP BAS from the subscription and select "Create Dev Space". Assign a desired name to your Dev Space and select the "Full Stack Cloud Application" type. Then, choose the `SAP HANA Application Migration Assistant` Extension to help with migration. Finally, click on "Create Dev Space".
   
3. Wait for the status of your newly created Dev Space to change to "Running". Once it's running, you can open it by clicking on the name of the Dev space that you just created.
   
4. Navigate to the folder by clicking on File -> Open Folder. Enter the path `/home/user/projects/` and click on OK.
   
5. Once the folder opens, you can select the SAP HANA Application Migration Assistant from the Command Palette (You can access the Command Palette from View -> Command Palette).

## Step-4: Migrate using the SAP HANA Application Migration Assistant

1. Open the the Command Palette and type "SAP HANA Application Migration Assistant" and select the command when it appears.
	
2. When the Migration Assistant Wizard opens, select the migration path. Since we are migrating from XS Classic to XS Advanced, select `XSC to XSA` as your migration path.		

<p align="center">
  <img width="536" alt="HomeScreen" src="images\HomescreenXSCtoXSA.png">
</p>


3. In the Data Source page of the wizard, choose the destination you previously created from the dropdown menu. 
	
<p align="center">
  <img width="544" alt="DestinationList" src="images\DestinationXSCtoXSA.png">
</p>

4. Enter the user credentials for the SAP HANA Database Migration User - username and password - into their respective fields. Hit the login button to authorize these credentials. [Procedure to create migration user](https://help.sap.com/docs/SAP_HANA_PLATFORM/58d81eb4c9bc4899ba972c9fe7a1a115/2786447387df41f69a0dad1cc2973e95.html#procedure). Then click on the Next button.
	
<p align="center">
<img width="545" alt="Login" src="images\UserCredXSCtoXSA.png">
</p>


5. In the "Migration Options" page, select "Delivery Unit" or "Package Name" as your source type from the drop-down menu. The SAP HANA Application Migration Assistant supports package level migration as well.

<p align="center">
<img width="545" alt="selectType" src="images\SourceXSCtoXSA.png">
</p>
  
6. Enter the name of your Source Delivery Unit in this case, it would be `HCO_DEMOCONTENT` or Source Package Name which will be `sap.hana.democontent.epm.data:true`. 	

<p align="center">
<img width="545" alt="DU1" src="images\DUSource.png">
</p>

<p align="center">
<img width="545" alt="DU1" src="images\packageSource.png">
</p>


7. Choose the target directory. This is where the migration results will be stored.
   
   **Note:** Ensure that the directory you select is a sub-directory of `/home/user/projects`.	

<p align="center">
<img width="545" alt="DU2" src="images\DeliveryUnit2.png">
</p>

8. Specify a unique name for the Target Folder, where the migration results will be saved. Once you've entered the name, click on Finish.

<p align="center">
<img width="545" alt="end" src="images\DeliveryUnit3.png">
</p>

9. Select the XSC Compatilibity Mode by setting it to True or False or leave it as it is to Default.

<p align="center">
<img width="545" alt="end" src="images\xscCompatibilityMode.png">
</p>

**xsc-compatibility-mode** is a view property introduced to maintain behavioral compatibility with how Calculation Views, especially those with aggregation nodes or star joins, worked in XS Classic (XSC) when migrating them to HANA Deployment Infrastructure (HDI) in XSA.
In the SAP HANA Application Migration Assistant, the UI provides a drop down with 3 options for the xsc-compatibility-mode. 
	They are: 
	<li>True: Sets the value to true and enables the legacy XS Classic behaviour in CVs</li>
 	<li>False: Sets the value to false and adopts the native XSA behaviour</li>
  	<li>Default: Retain the existing values for all CVs</li>

10. Select Migration type. By default, "Non-staged Migration" is chosen. In case if we have dependent objects outside our application like an external hdi container or schema, we need to migrate via staged migration. For further information, please refer [Staged Migration](https://help.sap.com/docs/SAP_HANA_PLATFORM/58d81eb4c9bc4899ba972c9fe7a1a115/954fd85b616b48a9b09a2f9b471eef41.html).

<p align="center">
<img width="545" alt="end" src="images\stagedMigration1.png">
</p>

11. If non-staged migration is selected, no other further steps are required. Click Finish. In case staged migration is selected, a new prompt appears to check whether we need to upload a configuration file including external dependencies or not. Choose "Yes" or "No" accordingly. By default, "No" will be selected.

<p align="center">
<img width="545" alt="end" src="images\stagedMigration1.png">
</p>

**Staged Migration** is used when there are objects in our container which have dependent objects in other hdi containers or external schemas. In the case of staged migration, separate hdbsynonyms, hdbsynonymconfigs and hdbgrants will be created for each external hdi container and external schema, the objects in our application depend upon. If all the objects required for deployment are present in our container, a **non-staged migration** would suffice.

12. If you choose "Yes", the prompt to browse configuration file must be visible. Choose the valid json file from the devspace. Once the valid json file is selected, we should be able to see the preview of the configuration file. Click "Finish" button.

<p align="center">
<img width="545" alt="end" src="images\stagedMigration3.png">
</p>

<p align="center">
<img width="545" alt="end" src="images\stagedMigration4.png">
</p>

13. Once you see the pop-up notification at the bottom right corner of your screen, it means that the migration process is underway. This notification will keep you updated on all the steps that follow. At the end of the process, a XS Advanced project with the revised database artifacts will be created. Additionally, a `report.html` file will be generated within the project. This file contains detailed information about your project's migration.

<p align="center">
<img width="545" alt="end" src="images\end.png">
</p>


## Known Issues in SAP HANA Application Migration Assistant
- Some artifacts which are currently not supported in the SAP HANA Application Migration Assistant require manual remodeling before deployment. You can find detailed information on manually migrating these artifacts in the following [link](https://help.sap.com/docs/hana-cloud/sap-hana-cloud-migration-guide/checks-performed-by-migration-tool).

## Learning Resources
1. [Prepare XS Classic Artifacts for Migration](https://help.sap.com/docs/SAP_HANA_PLATFORM/58d81eb4c9bc4899ba972c9fe7a1a115/a759b4815ae246649c83365cbcede79b.html).
2. [Prepare the Source System for the XS Application Migration](https://help.sap.com/docs/SAP_HANA_PLATFORM/58d81eb4c9bc4899ba972c9fe7a1a115/2786447387df41f69a0dad1cc2973e95.html).
3. [Migrating SAP HANA XS Javascript to Asynchronous XS Javascript in XS Advanced](https://help.sap.com/docs/SAP_HANA_PLATFORM/58d81eb4c9bc4899ba972c9fe7a1a115/9dfd58d4edd24b2c892f33987e8f42a5.html?version=2.0.07).
4. [Connect SAP Business Application Studio to XS Advanced](https://help.sap.com/docs/SAP_HANA_PLATFORM/cf8b4c5847374960a68b55cb86eae013/d1e4372023054dc8a92dac8118ee0088.html?state=DRAFT&version=2.0.08).

## How to obtain support
[Create an issue](https://github.com/SAP-samples/xsc-cap-migration/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## License
Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.


## How to obtain support
[Create an issue](https://github.com/SAP-samples/<repository-name>/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
