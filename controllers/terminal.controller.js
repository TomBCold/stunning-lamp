const { Order } = require("../db/models");
const axios = require("axios");
const { READYTOSHEP, APPLICATIONSENT } = require("../constants/statuses");
const Logger = require('../logger')

class TerminalController {
	async getOrders(req, res) {
		Logger.writeLog({}, 'Пришел запрос в API на получение новых заказов для доставки')
		try {
			const ordersFromDb = await Order.findAll({ where: { status: READYTOSHEP } });
			
			if (ordersFromDb.length !== 0) {
				const orders = ordersFromDb.map(el => el = {
					identifier: el.externalId,
					mobilePhone: el.mobilePhoneStore,
					fullname: el.fullnameStore,
					address: el.addressStore,
					company_name: el.companyName,
				});
				
				for (const order of ordersFromDb) {
					const date = new Date();
					await this.updateStatus(order, APPLICATIONSENT, date);
				}
				
				Logger.writeLog({}, 'Новые заказы переданы API тастаматов')
				res.json({ orders });
			} else {
				await Logger.writeLog({}, 'Новых заказов для доставки нет')
				res.json({ orders: [] });
			}
		} catch (e) {
			console.log(e);
			await Logger.writeError({}, 'Ошибка при получении новых заказов для доставки из БД', e)
		}
	}
	
	async getOrderInfo(req, res, externalId) {
		await Logger.writeLog({}, `API пришел запрос на получение данных заказа ${externalId}`)
		try {
			const orderFromDb = await Order.findOne({ where: { externalId} });
			const order = {
				trackNumber: orderFromDb.externalId,
				mobilePhone: orderFromDb.mobilePhoneClient,
				fullname: orderFromDb.nameClient,
				address: null,
				lockerIndex: orderFromDb.lockerIndex,
				parcelValue: orderFromDb.parcelValue
			};
			await Logger.writeLog(orderFromDb, 'Данные заказа отправлены')
			res.json(order);
		} catch (e) {
			console.log(e);
			await Logger.writeError({}, `Ошибка при получении данных заказа из БД ${externalId}`, e)
			res.json({});
		}
		
	}
	
	async setStatus(req, res) {
		const { date, identificator, status } = req.body;
		await Logger.writeLog({}, 'API пришел запрос на обновления статуса заказа')
		try {
			const order = await Order.findOne({ where: { externalId: identificator }});
			await this.updateStatus(order, status, date);
			const result = { identificator, status, result: "SUCCESS" };
			res.json(result);
		} catch (e) {
			const result = { identificator, status, result: "ERROR" };
			console.log(e);
			res.json(result);
		}
	}
	
	async updateStatus(order, newStatus, date) {
		try {
			await Order.update({ status: newStatus, dateTerminalStatus: date }, { where: { crmId: order.crmId }});
			await Logger.writeLog(order, 'Обновление статуса заказа в БД')
			
			const url = `https://testmarwin.retailcrm.ru/api/v5/orders/${order.crmId}/edit`;
			const orderBody = `order={\"customFields\": {\"tastamat_statuses\": \"${newStatus}\"}}`;
			const options = {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				params: {
					by: 'id',
					apiKey: process.env.CRMKEY,
					site: order.site
				}
			};
			
			await axios.post( url, orderBody, options );
			await Logger.writeLog(order, 'Обновление статуса заказа в CRM')
		} catch (e) {
			console.log(e);
			await Logger.writeError(order, 'Ошибка обновление статуса заказа', e)
		}
	}
}

module.exports = new TerminalController();
