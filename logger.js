const { Log } = require('./db/models');

class Logger {
	async writeLog(order, logText) {
		try {
			await Log.create({
				type: 'log',
				orderId: order.id,
				crmId: order.crmId,
				logText,
				errorText: null,
			})
		} catch (e) {
			console.log(e)
		}
	}
	
	async writeError(order, logText, errorText) {
		try {
			await Log.create({
				type: 'error',
				orderId: order.id,
				crmId: order.crmId,
				logText,
				errorText
			})
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new Logger();
