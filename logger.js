const { Log } = require('./db/models');

class Logger {
	async writeLog(title, order, logText) {
		try {
			await Log.create({
				type: 'log',
				title,
				orderId: order.id,
				crmId: order.crmId,
				logText
			})
		} catch (e) {
			console.log(e)
		}
	}
	
	async writeError(title, order, logText) {
		try {
			await Log.create({
				type: 'error',
				title,
				orderId: order.id,
				crmId: order.crmId,
				logText
			})
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new Logger();
