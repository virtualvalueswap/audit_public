const vRouter = artifacts.require("vRouter");
const vPair = artifacts.require("vPair");
const vPairFactory = artifacts.require("vPairFactory");
const vSwapMath = artifacts.require("vSwapMath");
const SafeERC20 = artifacts.require("SafeERC20");
const Address = artifacts.require("Address");
const utils = require("./utils");

const mysql = require("mysql");

const con = mysql.createConnection({
  host: "45.77.163.160",
  user: "backend",
  password: "vvSw@pp243",
});

async function connectDB() {
  return new Promise((resolve, rej) => {
    con.connect(async function (err) {
      console.log("Connected to MYSQL");
      if (!err) resolve({});

      rej(err);
    });
  });
}

async function queryDB(sql) {
  return new Promise((resolve, rej) => {
    con.query(sql, function (err, result) {
      if (err) rej(err);

      console.log("Updated versions table");
      resolve({});
    });
  });
}

const WETH = "0x0206953b5845106e8335E3e2224d1Fb2f90DB5c5";

module.exports = async function (deployer, network) {
  console.log("network name: " + network);

  await connectDB();

  //libraries
  await deployer.deploy(vSwapMath);
  await deployer.deploy(SafeERC20);
  await deployer.deploy(Address);

  await deployer.link(Address, vPairFactory);
  await deployer.link(SafeERC20, vPairFactory);
  await deployer.link(vSwapMath, vPairFactory);
  await deployer.deploy(vPairFactory);

  await deployer.link(Address, vRouter);
  await deployer.link(SafeERC20, vRouter);
  await deployer.link(vSwapMath, vRouter);
  let vPairFactoryAddress =
  vPairFactory.networks[Object.keys(vPairFactory.networks)[0]].address;

  await deployer.deploy(vRouter, vPairFactoryAddress, WETH);

  // const enviroment = network == "dev" ? 0 : 1;
  const enviroment = 1;

  let vRouterAddress =
    vRouter.networks[Object.keys(vRouter.networks)[0]].address;

  var sql = utils.generateVersionsSQL(
    vRouterAddress,
    vRouter.abi,
    "vpool",
    enviroment
  );
  await queryDB(sql);


  sql = utils.generateVersionsSQL(
    vPairFactoryAddress,
    vPairFactory.abi,
    "vfactory",
    enviroment
  );
  await queryDB(sql);

  sql = utils.generateVersionsSQL("", vPair.abi, "vpair", enviroment);
  //update last version on DB.
  await queryDB(sql);
};
