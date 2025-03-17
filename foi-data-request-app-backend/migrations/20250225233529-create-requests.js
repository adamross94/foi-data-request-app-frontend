module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      requestType: { type: Sequelize.STRING, allowNull: false },
      requestTitle: { type: Sequelize.STRING, allowNull: false },
      submissionDate: { type: Sequelize.DATEONLY, allowNull: false },
      deadline: { type: Sequelize.DATEONLY },
      details: { type: Sequelize.TEXT },
      status: {
        type: Sequelize.ENUM('Pending', 'In Progress', 'Completed', 'Unable to complete'),
        defaultValue: 'Pending'
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Requests');
  }
};
