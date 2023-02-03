const express = require('express');
const TerminalController = require('../controllers/terminal.controller')

const router = express.Router();

router.get(
	'/orders',
	async (req, res) => {
		await TerminalController.getOrders(req, res)
	}
);

router.put(
	'/status',
	async (req, res) => {
		await TerminalController.setStatus(req, res)
	}
);

router.get(
	'/order/:identifier',
	async (req, res) => {
		const externalId = req.params.identifier;
		await TerminalController.getOrderInfo(req, res, externalId)
	}
);

module.exports = router;
