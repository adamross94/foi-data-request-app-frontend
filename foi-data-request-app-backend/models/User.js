module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('requestor', 'administrator', 'reviewer'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.STRING,
    },
  }, {
    timestamps: true, // automatically adds createdAt and updatedAt
  });

  // Define associations within the 'associate' method
  User.associate = function(models) {
    // A User can have many Requests
    User.hasMany(models.Request, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
