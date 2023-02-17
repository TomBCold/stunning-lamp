const axios = require("axios");
const { Order } = require("../db/models");
const Logger = require('../logger')
const { APPLICATIONSENT, ACCEPTED, SUCCESS, ERROR } = require("../constants/statuses");
const {
	LOGAPINEWREQ,
	LOGAPIGETALLNEW,
	LOGAPINOTNEW,
	LOGAPIGETINFO,
	LOGAPIINFODONE,
	LOGAPISETSTATUS,
	LOGAPIUPDATEDB,
	LOGAPIUPDATECRM,
	ERRORAPINEWORDERS,
	ERRORAPIGETINFODB,
	ERRORAPIUPDATESTATUS
} = require('../constants/logTypes')

class TerminalController {
	async getOrders(req, res) {
		Logger.writeLog(LOGAPINEWREQ, {})
		try {
			const ordersFromDb = await Order.findAll({ where: { status: ACCEPTED } });
			
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
				
				Logger.writeLog(LOGAPIGETALLNEW, {}, JSON.stringify(ordersFromDb))
				res.json({ orders });
			} else {
				await Logger.writeLog(LOGAPINOTNEW, {}, )
				res.json({ orders: [] });
			}
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORAPINEWORDERS, {} , JSON.stringify(e))
		}
	}
	
	async getOrderInfo(req, res, externalId) {
		await Logger.writeLog(LOGAPIGETINFO, {}, externalId)
		try {
			const orderFromDb = await Order.findOne({ where: { externalId} });
			const order = {
				trackNumber: orderFromDb.externalId,
				mobilePhone: orderFromDb.mobilePhoneClient,
				fullname: orderFromDb.nameClient,
				address: '',
				lockerIndex: orderFromDb.lockerIndex,
				parcelValue: 0
			};
			await Logger.writeLog(LOGAPIINFODONE, orderFromDb, JSON.stringify(orderFromDb))
			res.json(order);
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORAPIGETINFODB, {}, JSON.stringify(e))
			res.json({});
		}
	}
	
	async setStatus(req, res) {
		const { date, identificator, status } = req.body;
		await Logger.writeLog(LOGAPISETSTATUS, {}, JSON.stringify(req.body))
		try {
			const order = await Order.findOne({ where: { externalId: identificator }});
			if(order) {
				await this.updateStatus(order, status, date);
				const result = { identificator, status, result: SUCCESS };
				res.json(result);
			} else {
				await Logger.writeError(ERRORAPIUPDATESTATUS, {}, 'Заказ не найден в базе')
				res.json({ identificator, status, result: ERROR });
			}
		} catch (e) {
			const result = { identificator, status, result: ERROR };
			console.log(e);
			await Logger.writeError(ERRORAPIUPDATESTATUS, {}, JSON.stringify(e))
			res.json(result);
		}
	}
	
	async updateStatus(order, newStatus, date) {
		let statusCrm = newStatus;
		switch (newStatus) {
			case "SENT": statusCrm = 'sent';
				break;
			case "WITHDRAWN": statusCrm = 'withdrawn';
				break;
			case "END": statusCrm = 'end';
				break;
		}
		try {
			await Order.update({ status: statusCrm, dateTerminalStatus: date }, { where: { crmId: order.crmId }});
			await Logger.writeLog(LOGAPIUPDATEDB, order )
			
			const url = `${process.env.RETAILCRM_URL}/orders/${order.crmId}/edit`;
			const orderBody = `order={\"customFields\": {\"tastamat_statuses\": \"${statusCrm}\"}}`;
			const options = {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				params: {
					by: 'id',
					apiKey: process.env.RETAILCRM_API_KEY,
					site: order.site
				}
			};
			await axios.post( url, orderBody, options );
			await Logger.writeLog(LOGAPIUPDATECRM, order )
		} catch (e) {
			console.log(e);
			await Logger.writeError(ERRORAPIUPDATESTATUS, order, JSON.stringify(e))
		}
	}
}

module.exports = new TerminalController();
