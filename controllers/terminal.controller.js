const axios = require("axios");
const { Order } = require("../db/models");
const Logger = require('../logger')
const { READYTOSHEP, APPLICATIONSENT, SUCCESS, ERROR } = require("../constants/statuses");
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
		Logger.writeLog({}, LOGAPINEWREQ)
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
				
				Logger.writeLog({}, LOGAPIGETALLNEW)
				res.json({ orders });
			} else {
				await Logger.writeLog({}, LOGAPINOTNEW)
				res.json({ orders: [] });
			}
		} catch (e) {
			console.log(e);
			await Logger.writeError({}, ERRORAPINEWORDERS, e)
		}
	}
	
	async getOrderInfo(req, res, externalId) {
		await Logger.writeLog({}, `${LOGAPIGETINFO} ${externalId}`)
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
			await Logger.writeLog(orderFromDb, LOGAPIINFODONE)
			res.json(order);
		} catch (e) {
			console.log(e);
			await Logger.writeError({}, `${ERRORAPIGETINFODB} ${externalId}`, e)
			res.json({});
		}
	}
	
	async setStatus(req, res) {
		const { date, identificator, status } = req.body;
		await Logger.writeLog({}, LOGAPISETSTATUS)
		try {
			const order = await Order.findOne({ where: { externalId: identificator }});
			await this.updateStatus(order, status, date);
			const result = { identificator, status, result: SUCCESS };
			res.json(result);
		} catch (e) {
			const result = { identificator, status, result: ERROR };
			console.log(e);
			res.json(result);
		}
	}
	
	async updateStatus(order, newStatus, date) {
		try {
			await Order.update({ status: newStatus, dateTerminalStatus: date }, { where: { crmId: order.crmId }});
			await Logger.writeLog(order, LOGAPIUPDATEDB)
			
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
			await Logger.writeLog(order, LOGAPIUPDATECRM)
		} catch (e) {
			console.log(e);
			await Logger.writeError(order, ERRORAPIUPDATESTATUS, e)
		}
	}
}

module.exports = new TerminalController();
