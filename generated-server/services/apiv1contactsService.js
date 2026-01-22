'use strict'

var db = require('../db');

module.exports.getContacts = async function getContact(req, res) {
    console.info('New GET request to the endpoint /contacts');
    try {
        const contacts = await db.find({});
        console.info('Sending contacts: ' + JSON.stringify(contacts, null, 2));
        res.send(contacts);
    } catch (err) {
        console.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};

module.exports.addContact = async function addContact(req, res) {
    var newContact = req.body;
    if (!newContact) {
        console.warn('New POST request to /contacts/ without contact, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    console.info('New POST request to /contacts with body: ' + JSON.stringify(newContact, null, 2));
    if (!newContact.name || !newContact.phone || !newContact.email) {
        console.warn('The contact ' + JSON.stringify(newContact, null, 2) + ' is not well-formed, sending 422...');
        res.status(422).send(); // unprocessable entity
        return;
    }

    try {
        const contacts = await db.find({ name: newContact.name });
        if (contacts.length > 0) {
            console.warn('The contact ' + JSON.stringify(newContact, null, 2) + ' already exists, sending 409...');
            res.status(409).send(); // conflict
            return;
        }

        console.info('Adding contact ' + JSON.stringify(newContact, null, 2));
        await db.insert(newContact);
        res.status(201).send(); // created
    } catch (err) {
        console.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};