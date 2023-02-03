'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      crmId: {
        type: Sequelize.STRING
      },
      externalId: {
        type: Sequelize.STRING
      },
      site: {
        type: Sequelize.STRING
      },
      storeCode: {
        type: Sequelize.STRING
      },
      addressStore: {
        type: Sequelize.STRING
      },
      mobilePhoneStore: {
        type: Sequelize.STRING
      },
      fullnameStore: {
        type: Sequelize.STRING
      },
      companyName: {
        type: Sequelize.STRING
      },
      nameClient: {
        type: Sequelize.STRING
      },
      mobilePhoneClient: {
        type: Sequelize.STRING
      },
      lockerIndex: {
        type: Sequelize.STRING
      },
      parcelValue: {
        type: Sequelize.STRING
      },
      dateTerminalStatus: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
