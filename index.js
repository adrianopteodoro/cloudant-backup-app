const couchbackup = require("@cloudant/couchbackup");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const settings = require("./settings");

const configs = {
  parallelism: 2,
  mode: "shallow"
};

const doBackup = () =>
  new Promise(resolve => {
    Promise.all(
      settings.db_list.map(
        db =>
          new Promise(res => {
            console.log(`Started backup of ${db}`);
            const backup = couchbackup.backup(
              `https://${settings.cloudant.account}:${
                settings.cloudant.password
              }@${settings.cloudant.account}.cloudant.com/${db}`,
              fs.createWriteStream(`backups/${db}.json`),
              configs,
              (err, data) => {
                if (err) {
                  console.error(`Failed on bckup of ${db}\n${err}`);
                  throw err;
                } else {
                  console.log(`${JSON.stringify(data, null, 2)}`);
                }
              }
            );
            backup.on("finished", () => {
              console.log(`Finished ${db}.`);
              res(db);
            });
          })
      )
    ).then(done => {
      if (done && done.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

const doBackupPackage = done =>
  new Promise(resolve => {
    const output = fs.createWriteStream(
      `${__dirname}/backup ${Date.now().toString()}.zip`
    );
    const archive = archiver("zip", {
      zlib: {
        level: 9
      } // Sets the compression level.
    });

    output.on("close", () => {
      console.log(
        `created ${output.path} file of ${archive.pointer()} total bytes`
      );
      resolve(done);
    });

    archive.on("error", err => {
      console.error(`Error: ${err}`);
      throw err;
    });

    archive.pipe(output);
    archive.directory("backups", false);
    archive.finalize();
  });

const doBackupCleanup = done =>
  new Promise(resolve => {
    Promise.all(
      fs.readdirSync("backups").map(
        file =>
          new Promise(res => {
            fs.unlink(`backups/${file}`, err => {
              if (err) throw err;
              console.log(`backups/${file} was deleted`);
              res(file);
            });
          })
      )
    ).then((files) => {
      if (files && files.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

const doProcess = async () => {
  const resbkp = await doBackup();
  if (resbkp) {
    const respkg = await doBackupPackage(resbkp);
    if (respkg) {
      const rescln = await doBackupCleanup(respkg);
      if (rescln) {
        console.log("Done!");
      }
    }
  } else {
    console.error("Cannot run backup process");
  }
};

doProcess();
