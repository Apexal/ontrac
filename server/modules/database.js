
const Student = db.define('student', {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    username: { type: Sequelize.STRING(30), allowNull: false },
    first_name: { type: Sequelize.STRING(15), allowNull: false },
    last_name: { type: Sequelize.STRING(30), allowNull: false },
    advisement: { type: Sequelize.STRING(20) },
    mpicture: { type: Sequelize.STRING(30) }
});

const Staff = db.define('staff', {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    username: { type: Sequelize.STRING(30), allowNull: false },
    first_name: { type: Sequelize.STRING(15), allowNull: false },
    last_name: { type: Sequelize.STRING(30), allowNull: false },
    department: { type: Sequelize.STRING(20) },
    mpicture: { type: Sequelize.STRING(30) }
});

const Course = db.define('course', {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    teacher_id: { type: Sequelize.INTEGER, references: { model: Staff, key: 'id' } },
    title: { type: Sequelize.STRING(50), allowNull: false }
});

module.exports = {
    db: db,
    Student: Student,
    Staff: Staff,
    Course: Course
};