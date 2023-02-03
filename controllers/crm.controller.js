const axios = require("axios");
const { Order } = require('../db/models');
const { READYTOSHEP }  = require('../constants/statuses');

class CrmController {
	
	async checkNewOrders() {
		const newOrders = await this.getNewOrders();
		
		if (newOrders.length !== 0) {
			const allStores = await this.getAllStores()
			for (const order of newOrders) {
				await this.createOrderDb(order, allStores);
			}
		} else {
			console.log('Новых заказов нет')
		}
	}
	
	async getNewOrders() {
		try {
			const url = 'https://testmarwin.retailcrm.ru/api/v5/orders?filter[customFields][tastamat_statuses][]=ready-to-ship';
			const options = {
				params: {
					apiKey: process.env.CRMKEY
				}
			};
			
			const allNewOrders = await axios(url, options);
			return allNewOrders.data.orders;
		} catch (error) {
			console.log(error)
		}
	}
	
	async createOrderDb(order, allStores) {
		const { id, externalId, site, phone, firstName, lastName, totalSumm, shipmentStore } = order;
		const nameClient = lastName + ' ' + firstName;
		const lockerIndex = order.delivery.service.code.substring(9);
		const fullnameStore = order.customFields.warehouse_contact_person;
		const store = allStores.filter(el => el.code === shipmentStore);
		const addressStore = store[0].address.text;
		const mobilePhoneStore = store[0].phone.number;
		
		try {
			await Order.create({
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
		} catch (e) {
			console.log(e)
		}
	}
	
	async getAllStores() {
		try {
			const allStores = await axios('https://testmarwin.retailcrm.ru/api/v5/reference/stores', {
				//TODO позже добавят фильтр по конкретному складу
				params: {
					apiKey: process.env.CRMKEY,
					limit: 100
				}
			});
			return allStores.data.stores;
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new CrmController();
