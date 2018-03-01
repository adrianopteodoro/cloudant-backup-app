const couchbackup = require("@cloudant/couchbackup");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const settings = require("./settings");

const configs = {
  parallelism: 2
};

const doRestore = () =>
  new Promise(resolve => {
    Promise.all(
      fs.readdirSync("restore").map(
        file =>
          new Promise(res => {
            const fExt = path.extname(file);
            if (fs.statSync(`restore/${file}`).isFile() && fExt === ".json") {
              const db = path.basename(file, fExt);
              console.log(file);
              const restore = couchbackup.restore(
                fs.createReadStream(`restore/${file}`),
                `https://${settings.cloudant.account}:${
                  settings.cloudant.password
                }@${settings.cloudant.account}.cloudant.com/${db}`,
                configs,
                (err, data) => {
                  if (err) {
                    console.error(`Failed to restore ${db}\n${err}`);
                    throw err;
                  } else {
                    console.log(`${JSON.stringify(data, null, 2)}`);
                  }
                }
              );
              restore.on("finished", () => {
                console.log(`Finished ${db}.`);
                res(db);
              });
            } else {
              res(false);
            }
          })
      )
    ).then(files => {
      if (files && files.length > 0) {
        console.log(`Promises result: ${files}`);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

doRestore().then(done => {
  if (done) {
    console.log("Done!");
  }
});
