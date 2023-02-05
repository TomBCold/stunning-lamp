'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Log extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.Order, { foreignKey: 'oderId' });
			
		}
	}
	Log.init({
		type: DataTypes.STRING,
		orderId: DataTypes.INTEGER,
		crmId: DataTypes.STRING,
		logText: DataTypes.TEXT,
		errorText: DataTypes.TEXT,
	}, {
		sequelize,
		modelName: 'Log',
	});
	return Log;
};
