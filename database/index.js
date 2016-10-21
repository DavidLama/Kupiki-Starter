const models = require('./models');

const db = models.sequelize;

const User = models.User;

module.exports = connect = () => {
  return new Promise((resolve, reject) => {
    try {
      models.sequelize.sync().then(() => {
        resolve(models);
      });
    } catch (error) {
      reject(error);
    }
  });
};