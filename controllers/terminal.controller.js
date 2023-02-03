const {Order} = require("../db/models");
const axios = require("axios");
const { READYTOSHEP, APPLICATIONSENT } = require("../constants/statuses");

class TerminalController {
	async getOrders(req, res) {
		try {
			const ordersFromBd = await Order.findAll({where: { status: READYTOSHEP }});
			if (ordersFromBd.length !== 0) {
				const orders = ordersFromBd.map(el => el = {
					//TODO переделать на данные ответственного лица
					identifier: el.externalId,
					mobilePhone: el.mobilePhoneStore,
					fullname: el.fullnameStore,
					address: el.addressStore,
					company_name: el.companyName,
				})
				for (const order of ordersFromBd) {
					const date = new Date();
					await this.updateStatus(order, APPLICATIONSENT, date);
				}
			res.json({orders});
			} else {res.json([])};
		} catch (e) {
			console.log(e);
		}
	}
	
	async getOrderInfo(req, res, externalId) {
		try {
			const orderFromBd = await Order.findOne({where: { externalId}})
			const order = {
				trackNumber: orderFromBd.externalId,
				mobilePhone: orderFromBd.mobilePhoneClient,
				fullname: orderFromBd.nameClient,
				address: null,
				lockerIndex: orderFromBd.lockerIndex,
				parcelValue: orderFromBd.parcelValue
			}
			res.json(order);
		} catch (e) {
			console.log(e)
			res.json('ERROR');
		}
		
	}
	
	async setStatus(req, res) {
		const { date, identificator, status } = req.body;
		console.log(date, identificator, status)
		try {
			const order = await Order.findOne({where: { externalId: identificator }})
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
			await Order.update({status: newStatus, dateTerminalStatus: date}, {where: { crmId: order.crmId }})
			const orderBody = `order={\"customFields\": {\"tastamat_statuses\": \"${newStatus}\"}}`;
			await axios.post(
				`https://testmarwin.retailcrm.ru/api/v5/orders/${order.crmId}/edit`,
				orderBody,
				{
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					params: {
						by: 'id',
						apiKey: process.env.CRMKEY,
						site: order.site
					}
				}
			);
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = new TerminalController();
