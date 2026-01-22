'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

// Connection URL
const url = 'mongodb://mongo:27017';

// Database Name
const dbName = 'contacts';

// Create a new MongoClient using the promise-based API
const client = new MongoClient(url);

let _collection;

// Creates the connection to the database
module.exports.connect = async function connect() {
    if (_collection) {
        console.warn('Trying to create the DB connection again!');
        return _collection;
    }
    try {
        await client.connect();
        _collection = client.db(dbName).collection(dbName);
        return _collection;
    } catch (err) {
        console.error('Error connecting to DB!', err);
        process.exit(1);
    }
};

// Return the connection to the database if it was previously created
module.exports.getConnection = function getConnection() {
    assert.ok(_collection, 'DB connection has not been created. Please call connect() first.');
    return _collection;
};

// Helper method to initialize the database with sample data
module.exports.init = async function init() {
    const sampleContacts = [
        {
            name: 'John',
            phone: 601234567,
            email: 'john.doe@example.com'
        },
        {
            name: 'Jane',
            phone: 954556357,
            email: 'jane.doe@example.com'
        },
        {
            name: 'Foo',
            phone: 954556358,
            email: 'foo@example.com'
        },
        {
            name: 'Bar',
            phone: 954556359,
            email: 'bar@example.com'
        }
    ];
    const collection = this.getConnection();
    return collection.insertMany(sampleContacts);
};

// Executes the query and returns the result
module.exports.find = async function find(query) {
    const collection = this.getConnection();
    return collection.find(query).toArray();
};

// Inserts a new document in the database
module.exports.insert = async function insert(doc) {
    const collection = this.getConnection();
    const result = await collection.insertOne(doc);
    return result.insertedId;
};

// Updates a document that matches the query
module.exports.update = async function update(query, newDoc) {
    const collection = this.getConnection();
    const result = await collection.replaceOne(query, newDoc);
    return result.modifiedCount;
};

// Removes a document from the database
module.exports.remove = async function remove(query) {
    const collection = this.getConnection();
    const result = await collection.deleteOne(query);
    return result.deletedCount;
};