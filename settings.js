require('dotenv').config();

module.exports = {
  cloudant: {
    account: process.env.CLOUDANT_USERNAME,
    password: process.env.CLOUDANT_PASSWORD,
  },
  db_list: [
  ],
};