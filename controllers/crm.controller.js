const axios = require("axios");
const { Order } = require('../db/models');
const { READYTOSHEP }  = require('../constants/statuses');
const Logger = require('../logger')

class CrmController {
	async checkNewOrders() {
		await Logger.writeLog({}, 'Начало проверки наличия новых заказов')
		const newOrders = await this.getNewOrders();
		if (newOrders.length !== 0) {
			await Logger.writeLog({}, 'Получены новые заказы из CRM')
			const allStores = await this.getAllStores()
			for (const order of newOrders) {
				const store = allStores.find(el => el.code === order.shipmentStore);
				await this.createOrderDb(order, store);
			}
		} else {
			console.log('Новых заказов нет')
			await Logger.writeLog({}, 'Новых заказов нет');
		}
	}
	
	async getNewOrders() {
		try {
			const url = 'https://testmarwin.retailcrm.ru/api/v5/orders?filter[customFields][tastamat_statuses][]=ready-to-ship';
			const options = {
				params: { apiKey: process.env.CRMKEY }
			};
			const allNewOrders = await axios(url, options);
			return allNewOrders.data.orders;
		} catch (error) {
			console.log(error)
			await Logger.writeError({}, 'Ошибка при запросе в CRM для новых заказов', error)
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
			await Logger.writeLog(orderInDb, 'Запись нового заказа в БД');
		} catch (e) {
			console.log(e);
			await Logger.writeError({ crmId: order.id }, 'Ошибка при записи нового заказа в БД', e)
		}
	}
	
	async getAllStores() {
		try {
			const url = 'https://testmarwin.retailcrm.ru/api/v5/reference/stores';
			const options = {
				params: {
					apiKey: process.env.CRMKEY,
					limit: 100
				}
			}
			const allStores = await axios(url, options);
			await Logger.writeLog({}, 'Получен список всех складов')
			return allStores.data.stores;
		} catch (e) {
			console.log(e)
			await Logger.writeError({}, 'Ошибка при запросе в CRM для всех складов', e)
		}
	}
}

module.exports = new CrmController();
