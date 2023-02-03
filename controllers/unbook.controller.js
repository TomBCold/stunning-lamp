const axios = require("axios");
const CryptoJS = require("crypto-js");
const { Order } = require('../db/models');
const { FAILURE, CANCELLED, UNRESERVED }  = require('../constants/statuses');

class unbookController {
	
	async unbooking() {
		const newCancelledOrders = await this.hasNewCancelledOrder();
		if (newCancelledOrders.length !== 0) {
			for (const order of newCancelledOrders) {
				await this.statusCancelBd(order);
			}
			const ordersForUnbook = await Order.findAll({where: {statusBox: CANCELLED}})
			for (const order of ordersForUnbook) {
				const resTerminal = await this.unbookBox(order);
				if (resTerminal.status === UNRESERVED) {
				
					await this.statusBdUnbooked(order, resTerminal);
					await this.statusCrmUnbooked(order, resTerminal);
				} else {
					await this.cancelTerminal(order)
				}
			}
		} else {
			console.log('Новых заказов нет')}
	}
	
	async hasNewCancelledOrder() {
		try {
			// TODO уточнить какой статус отмены нужно отслеживать
			const allNewOrders = await axios('https://testmarwin.retailcrm.ru/api/v5/orders?filter[deliveryTypes][]=5&filter[extendedStatus][]=ready-to-ship', {
				params: {
					apiKey: process.env.CRMKEY
				}
			});
			return allNewOrders.data.orders.filter(order => order.delivery.service.code.includes('tastamat'));
		} catch (error) {
			console.log(error)
		}
	}
	
	async statusCancelBd(order) {
		const { id } = order;
		try {
			await Order.update({statusBox: CANCELLED}, {where: { crmId: id }})
		} catch (error) {
			console.log(error)
		}
	}
	
	async unbookBox(order) {
		const key = process.env.APIKEY;
		const token = process.env.APITOKEN;
		const identifier = order.crmId;
		// TODO где в заказе размер ячейки
		const msg = `{ "identifier": ${identifier} }`;
		const hash = CryptoJS.HmacSHA256(msg, token);
		const xmac = hash.toString(CryptoJS.enc.Base64);
		const headers = {'x-hmac': xmac, 'x-hmac-key': key};
		try {
			// const res =  await axios.put('https://testplatform.tastamat.com/platform/v1/rest/i/orders/unbook', msg, {headers});
			// return res
			return { status: UNRESERVED }
		} catch (e) {
			console.log(e)
		}
	}
	
	async statusBdUnbooked(order) {
		const { id } = order;
		try {
			await Order.update({statusBox: UNRESERVED}, {where: { id }})
		} catch (error) {
			console.log(error)
		}
	}
	
	async statusCrmUnbooked(order) {
		const { crmId, site } = order;
		const orderBody = `order={\"customFields\": {\"tastamat_statuses\": \"unreserved\"}}`;
		try {
			await axios.post(
				`https://testmarwin.retailcrm.ru/api/v5/orders/${crmId}/edit`,
				orderBody,
				{
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					params: {
						by: 'id',
						apiKey: process.env.CRMKEY,
						site
					}
				}
			);
		} catch (error) {
			console.log(error)
		}
	}
	
	async cancelTerminal(order) {
		// TODO решить что делать при занятых ячейках, например добавить в справочник поля "Отказ терминала"
		const { id, crmId } = order;
		const orderBody = `order={\"customFields\": {\"tastamat_statuses\": \"failure\"}}`;
		try {
			await Order.update({statusBox: FAILURE }, {where: { id }})
			await axios.post(
				`https://testmarwin.retailcrm.ru/api/v5/orders/${crmId}/edit`,
				orderBody,
				{
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					params: {
						by: 'id',
						apiKey: process.env.CRMKEY,
						site
					}
				}
			);
		} catch (error) {
			console.log(error)
		}
	}
	
}

module.exports = new BookController();
