// MongoDB

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUS}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri);

let collection;

const getCollection = (dbName, clName) =>
  mongoClient.db(dbName).collection(clName);

exports.connect = async function(dbName, clName) {
  console.log('Mongo connecting...');

  try {
    await mongoClient.connect();
    await mongoClient.db(dbName).command({ ping: 1 });

    if (dbName && clName) collection = getCollection(dbName, clName);

    console.log('Mongo connected');
  } catch (err) {
    console.error(err);
  };
};

exports.findOne = async function(opts) {
  const { filter = {}, projection = {} } = opts;

  let result;
  try {
    result = await collection.findOne(filter, { projection });
  } catch (err) {
    console.error(err);
  };
  return result;
};

exports.findMany = async function(opts) {
  const { filter = {}, projection = {}, flags = [] } = opts;

  let result = [];
  try {
    const cursor = await collection.find(filter).project(projection);

    if (flags.includes('toArray')) {
      result = await cursor.toArray();
    } else {
      await cursor.forEach(doc => result.push(doc));
    };

  } catch (err) {
    console.error(err);
  };

  return result;
};

exports.updateOne = async function(opts) {
  const { filter = {}, upDoc } = opts;

  let result;
  try {
    result = await collection.updateOne(filter, upDoc);
  } catch (err) {
    console.error(err);
  };
  return result;
};

exports.updateMany = async function(opts) {
  const { filter = {}, upDoc } = opts;

  let result;
  try {
    result = await collection.updateMany(filter, upDoc);
  } catch (err) {
    console.error(err);
  };
  return result;
};

exports.insertOne = async function(doc) {
  let result;
  try {
    result = await collection.insertOne(doc);
  } catch (err) {
    console.error(err);
  };
  return result;
};

exports.insertMany = async function(docs) {
  let result;
  try {
    result = await collection.insertMany(docs);
  } catch (err) {
    console.error(err);
  };
  return result;
};

exports.deleteOne = async function(filter) {
  let result;
  try {
    result = await collection.deleteOne(filter);
  } catch (err) {
    console.error(err);
  };
  return result;
};