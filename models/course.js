'use strict';
module.exports = function(sequelize, DataTypes) {
  var Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    teacher_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        Course.hasOne(models.Staff, { as: 'Teacher', foreignKey: 'id' });
        Course.belongsToMany(models.Student, { as: 'Students', through: 'students_courses', foreignKey: 'course_id', timestamps: false });
      }
    },
    tableName: 'courses'
  });
  return Course;
};