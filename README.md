# cloudant-backup-app

Simple cloudant backup maker

Edit in `settings.js` your cloudant database list
```javascript
db_list: [
  'db_name',
  'db_sample'
  'test_db_name'
],
```

create a `.env` file on the root and add your cloudant username/password
```ini
CLOUDANT_USERNAME=<cloudant_usename>
CLOUDANT_PASSWORD=<cloudant_password>
```

run `npm i` and after `npm start`