// import mongoose from "mongoose";
// mongoose.set("strictQuery", false);
// let connection;
// const mongoURL = `mongodb://0.0.0.0:27017/vendorReconciliation`;
// connection: any = mongoose.createConnection(mongoURL, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// }); // database name
// connection.on("error", (err) => {
//   console.log("err", err);
//   //permittedCrossDomainPolicies.log(err)
// });
// //console.log('connection', connection)
// // module.exports = connection;
// export default connection;

import mongoose from "mongoose";

// mongoose.set("useUnifiedTopology", true);
// mongoose.set("useNewUrlParser", true);

const mongoURL = "mongodb://0.0.0.0:27017/vendorReconciliation";
const connection = mongoose.createConnection(mongoURL);

connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export default connection;
