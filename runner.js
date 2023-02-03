const BookController = require('./controllers/crm.controller');

const run = () => {
	setInterval(() => {
		BookController.checkNewOrders()
	}, 5000)
	
}

module.exports = { run };
