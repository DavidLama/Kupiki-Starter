"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
      username: {
        type: DataTypes.STRING,
        unique: {
          msg: 'The specified login is already in use.'
        },
        validate: {
          notEmpty: true
        }
      },      
      password      : DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          msg: 'The specified email address is already in use.'
        },
      },
      name          : DataTypes.STRING,
      gender        : DataTypes.STRING,
      location      : DataTypes.STRING,
      website       : DataTypes.STRING,
      picture       : DataTypes.STRING
  }, {
    instanceMethods: {
      gravatar: function (size = 200) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
      }
    }
  });

  return User;
};