const express = require('express');
const CrmController = require('../controllers/crm.controller');

const router = express.Router();

router.post(
	'/orderforship',
	async (req, res) => {
		await CrmController.newOrder(req, res);
	}
);

module.exports = router;
