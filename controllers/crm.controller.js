const axios = require("axios");
const { Order } = require('../db/models');
const Logger = require('../logger')
const TerminalController = require('./terminal.controller')
const { READYTOSHEP, ACCEPTED }  = require('../constants/statuses');
const { URLCRM } = require('../constants/urls')
const {
	LOGSTARTCHECK,
	LOGNEWORDERS,
	LOGNOTNEW,
	LOGWRITENEWDB,
	LOGGETALLSTORES,
	ERRORCHECKCRM,
	ERRORNEWDB,
	ERRORALLSTORES
} = require('../constants/logTypes')

class CrmController {
	async checkNewOrders() {
		await Logger.writeLog({}, LOGSTARTCHECK)
		const newOrders = await this.getNewOrders();
		if (newOrders.length !== 0) {
			await Logger.writeLog({}, LOGNEWORDERS)
			const allStores = await this.getAllStores()
			for (const order of newOrders) {
				const store = allStores.find(el => el.code === order.shipmentStore);
				await this.createOrderDb(order, store);
			}
		} else {
			console.log(LOGNOTNEW)
			await Logger.writeLog({}, LOGNOTNEW);
		}
	}
	
	async getNewOrders() {
		try {
			const url = `${URLCRM}/orders?filter[customFields][tastamat_statuses][]=ready-to-ship`;
			const options = {
				params: { apiKey: process.env.CRMKEY }
			};
			const allNewOrders = await axios(url, options);
			return allNewOrders.data.orders;
		} catch (error) {
			console.log(error)
			await Logger.writeError({}, ERRORCHECKCRM, error)
		}
	}
	
	async createOrderDb(order, store) {
		const { id, externalId, site, phone, firstName, lastName, totalSumm, shipmentStore } = order;
		const nameClient = `${lastName} ${firstName}`;
		const lockerIndex = order.delivery.service.code.substring(9);
		const fullnameStore = order.customFields.warehouse_contact_person;
		const addressStore = store.address.text;
		const mobilePhoneStore = store.phone.number;
		try {
			const orderInDb = await Order.create({
				crmId: id,
				externalId,
				site,
				storeCode: shipmentStore,
				addressStore,
				mobilePhoneStore,
				fullnameStore,
				//TODO решить с этим полем
				companyName: site,
				nameClient,
				mobilePhoneClient: phone,
				lockerIndex,
				parcelValue: totalSumm,
				status: READYTOSHEP
			});
			await Logger.writeLog(orderInDb, LOGWRITENEWDB);
			await TerminalController.updateStatus(orderInDb, ACCEPTED)
		} catch (e) {
			console.log(e);
			await Logger.writeError({ crmId: order.id }, ERRORNEWDB, e)
		}
	}
	
	async getAllStores() {
		try {
			const url = `${URLCRM}/reference/stores`;
			const options = {
				params: {
					apiKey: process.env.CRMKEY,
					limit: 100
				}
			}
			const allStores = await axios(url, options);
			await Logger.writeLog({}, LOGGETALLSTORES)
			return allStores.data.stores;
		} catch (e) {
			console.log(e)
			await Logger.writeError({}, ERRORALLSTORES, e)
		}
	}
}

module.exports = new CrmController();
