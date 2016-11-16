'use strict';
module.exports = function(sequelize, DataTypes) {
  var Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    username: { type: DataTypes.STRING(30), allowNull: false },
    first_name: { type: DataTypes.STRING(15), allowNull: false },
    last_name: { type: DataTypes.STRING(30), allowNull: false },
    advisement: { type: DataTypes.STRING(20) },
    mpicture: { type: DataTypes.STRING(30) }
  }, {
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        //Student.hasMany(models.Course);
        Student.belongsToMany(models.Course, { as: 'Courses', through: 'students_courses', foreignKey: 'student_id', timestamps: false });
      }
    },
    tableName: 'students'
  });
  return Student;
};