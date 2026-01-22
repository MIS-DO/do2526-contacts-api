'use strict'

var db = require('../db');

module.exports.findByname = async function findByname(req, res) {
    var name = req.params.name;
    if (!name) {
        console.warn('New GET request to /contacts/:name without name, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    console.info('New GET request to /contacts/' + name);
    try {
        const filteredContacts = await db.find({ name: name });
        if (filteredContacts.length > 0) {
            var contact = filteredContacts[0]; // we expect exactly one contact per name
            console.info('Sending contact: ' + JSON.stringify(contact, null, 2));
            res.send(contact);
        } else {
            console.warn('There are no contacts with name ' + name);
            res.status(404).send(); // not found
        }
    } catch (err) {
        console.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};


module.exports.updateContact = async function updateContact(req, res) {
    var updatedContact = req.body;
    var name = req.params.name;
    if (!updatedContact) {
        console.warn('New PUT request to /contacts/ without contact, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    console.info('New PUT request to /contacts/' + name + ' with data ' + JSON.stringify(updatedContact, null, 2));
    if (!updatedContact.name || !updatedContact.phone || !updatedContact.email) {
        console.warn('The contact ' + JSON.stringify(updatedContact, null, 2) + ' is not well-formed, sending 422...');
        res.status(422).send(); // unprocessable entity
        return;
    }

    try {
        const contacts = await db.find({ name: updatedContact.name });
        if (contacts.length > 0) {
            await db.update({ name: name }, updatedContact);
            console.info('Modifying contact with name ' + name + ' with data ' + JSON.stringify(updatedContact, null, 2));
            res.status(204).send(); // no content
        } else {
            console.warn('There are not any contact with name ' + name);
            res.status(404).send(); // not found
        }
    } catch (err) {
        console.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};


module.exports.deleteContact = async function deleteContact(req, res) {
    var name = req.params.name;
    if (!name) {
        console.warn('New DELETE request to /contacts/:name without name, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    console.info('New DELETE request to /contacts/' + name);
    try {
        var numRemoved = await db.remove({ name: name });
        console.info('Contacts removed: ' + numRemoved);
        if (numRemoved === 1) {
            console.info('The contact with name ' + name + ' has been succesfully deleted, sending 204...');
            res.status(204).send(); // no content
        } else {
            console.warn('There are no contacts to delete');
            res.status(404).send(); // not found
        }
    } catch (err) {
        console.error('Error removing data from DB', err);
        res.status(500).send(); // internal server error
    }
};
