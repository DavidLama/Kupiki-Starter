"use strict";

const crypto = require('crypto');

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
      password            : DataTypes.STRING,
      passwordResetToken  : DataTypes.STRING,
      passwordResetExpires: DataTypes.DATE,
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
        if (!this.email) {
          return `https://gravatar.com/avatar/?s=${size}&d=retro`;
        }
        var md5 = crypto.createHash('md5').update(this.email).digest('hex');
        return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
      }
    }
  });

  return User;
};