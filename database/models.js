const {Sequelize, DataTypes} = require('sequelize')

//db config
const DB = "crud"
const sequelize = new Sequelize(DB, "ivan", "mamageor28", {
    host: "localhost",
    dialect: "mysql"
})

//hash lib
const bcrypt = require('bcrypt')

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

const User = sequelize.define(
    'User',
    {
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }, 
        Password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        tableName: "users",
        timestamps: false,
        createdAt: false,
        updatedAt:false,

        hooks: {
            beforeCreate: async(user) => {
                const hashedPassword = await bcrypt.hash(user.Password, 10);
                user.Password = hashedPassword
            },
        }
    }
);

module.exports = {Tasks, User}
