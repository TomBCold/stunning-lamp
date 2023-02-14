const axios = require("axios");
const { Order } = require('../db/models');
const Logger = require('../logger');
const TerminalController = require('./terminal.controller');
const { READYTOSHEP, ACCEPTED }  = require('../constants/statuses');
const { URLCRM } = require('../constants/urls');
const {
	LOGNEWORDERINFO,
	LOGNEWORDER,
	LOGWRITENEWDB,
	LOGGETALLSTORES,
	ERRORNEWDB,
	ERRORNEWORDERINFO,
	ERRORALLSTORES,
	ERRORNEWCRM
} = require('../constants/logTypes');

class CrmController {
	async newOrder(req, res) {
		try {
			await Logger.writeLog(LOGNEWORDER, { crmId: req.body.id });
			const { id } = req.body;
			const newOrder = await this.getNewOrder(id);
			const store = await this.getStore(newOrder);
			await this.createOrderDb(newOrder, store);
			return res.sendStatus(200);
		} catch (e) {
			console.log(e)
			await Logger.writeError(ERRORNEWCRM, {crmId: req.body.id}, `${e}`);
			return res.sendStatus(400);
		}
	}
	
	async getNewOrder(id) {
		try {
			const url = `${URLCRM}/orders/?filter[ids][]=${id}`;
			const options = { params: { apiKey: process.env.CRMKEY }};
			const order = await axios(url, options);
			await Logger.writeLog(LOGNEWORDERINFO, {crmId: id}, JSON.stringify(order.data.orders[0]));
			return order.data.orders[0];
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORNEWORDERINFO, {}, `${e}`);
		}
	}
	
	async createOrderDb(order, store) {
		const { id, externalId, site, phone, firstName, lastName,  shipmentStore } = order;
		const nameClient = `${lastName} ${firstName}`;
		const lockerIndex = order.delivery.service.code.substring(9);
		const fullnameStore = order.customFields.warehouse_contact_person;
		const addressStore = store.address.text;
		const mobilePhoneStore = store.phone.number.substring(1);
		try {
			const orderInDb = await Order.create({
				crmId: id,
				externalId,
				site,
				storeCode: shipmentStore,
				addressStore,
				mobilePhoneStore,
				fullnameStore,
				companyName: site,
				nameClient,
				mobilePhoneClient: phone.substring(1),
				lockerIndex,
				status: READYTOSHEP
			});
			await Logger.writeLog(LOGWRITENEWDB, orderInDb, `${orderInDb}`);
			await TerminalController.updateStatus(orderInDb, ACCEPTED);
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORNEWDB, { crmId: order.id }, `${e}`);
		}
	}
	
	async getStore(newOrder) {
		try {
			const url = `${URLCRM}/reference/stores`;
			const options = {
				params: {
					apiKey: process.env.CRMKEY,
					limit: 100
				}
			}
			const allStores = await axios(url, options);
			await Logger.writeLog(LOGGETALLSTORES, {}, `${allStores}`);
			return allStores.data.stores.find(el => el.code === newOrder.shipmentStore);
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORALLSTORES, { crmId: order.id }, `${e}`);
		}
	}
}

module.exports = new CrmController();
