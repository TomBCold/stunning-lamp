'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Log, { foreignKey: 'orderId' });
    }
  }
  Order.init({
    crmId: DataTypes.STRING,
    externalId: DataTypes.STRING,
    site: DataTypes.STRING,
    storeCode: DataTypes.STRING,
    addressStore: DataTypes.STRING,
    mobilePhoneStore: DataTypes.STRING,
    fullnameStore: DataTypes.STRING,
    companyName: DataTypes.STRING,
    nameClient: DataTypes.STRING,
    mobilePhoneClient: DataTypes.STRING,
    lockerIndex: DataTypes.STRING,
    dateTerminalStatus: DataTypes.DATE,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
