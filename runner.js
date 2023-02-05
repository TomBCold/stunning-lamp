const BookController = require('./controllers/crm.controller');

const run = () => {
	setInterval(() => {
		BookController.checkNewOrders()
	}, 20000)
}

module.exports = { run };
