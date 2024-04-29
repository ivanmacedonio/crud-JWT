const {Sequelize, DataTypes} = require('sequelize')

//db config
const DB = "crud"
const sequelize = new Sequelize(DB, "ivan", "mamageor28", {
    host: "localhost",
    dialect: "mysql"
})

const Tasks = sequelize.define(
    'Task',
    {
        Title: {
            type: DataTypes.STRING,
            allowNull: false,
        }, 
        Description : {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        Completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull:false
        }
    }, {
        tableName: "tasks",
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    }
)

module.exports = Tasks