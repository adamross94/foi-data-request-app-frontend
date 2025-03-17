module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    requestType: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    requestTitle: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    submissionDate: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    deadline: { 
      type: DataTypes.DATEONLY, // e.g., response deadline
    },
    details: { 
      type: DataTypes.TEXT 
    },
    status: { 
      type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Unable to complete'),
      defaultValue: 'Pending'
    }
  }, {
    timestamps: true,
    freezeTableName: true, // Prevents Sequelize from pluralizing the table name
  });

  // Define associations within the 'associate' method
  Request.associate = function(models) {
    // A Request belongs to a User
    Request.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Request;
};
