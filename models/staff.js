'use strict';
module.exports = function(sequelize, DataTypes) {
  var Staff = sequelize.define('Staff', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    username: { type: DataTypes.STRING(30), allowNull: false },
    first_name: { type: DataTypes.STRING(15), allowNull: false },
    last_name: { type: DataTypes.STRING(30), allowNull: false },
    department: { type: DataTypes.STRING(20) }
  }, {
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    tableName: 'staffs'
  });
  return Staff;
};