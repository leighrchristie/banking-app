const {Sequelize, Model, DataTypes} = require('sequelize')
const path = require('path')
const sequelize = process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', null, null, {dilect: 'sqlite'})
    : new Sequelize({dialect: 'sqlite', storage: path.join(__dirname, 'data.db')})


class User extends Model {}
User.init ({
    name: DataTypes.STRING,
    email: DataTypes.STRING
}, {sequelize:  sequelize})

module.exports = {
    User,
    sequelize
}