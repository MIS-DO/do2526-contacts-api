'use strict'

var db = require('../db');
const logger = require('../logger');

module.exports.findByname = async function findByname(req, res) {
    var name = req.params.name;
    if (!name) {
        logger.warn('New GET request to /contacts/:name without name, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    logger.info('New GET request to /contacts/' + name);
    try {
        const filteredContacts = await db.find({ name: name });
        if (filteredContacts.length > 0) {
            var contact = filteredContacts[0]; // we expect exactly one contact per name
            logger.debug('Sending contact: ' + JSON.stringify(contact, null, 2));
            res.send(contact);
        } else {
            logger.warn('There are no contacts with name ' + name);
            res.status(404).send(); // not found
        }
    } catch (err) {
        logger.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};


module.exports.updateContact = async function updateContact(req, res) {
    var updatedContact = req.body;
    var name = req.params.name;
    if (!updatedContact) {
        logger.warn('New PUT request to /contacts/ without contact, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    logger.info('New PUT request to /contacts/' + name + ' with data ' + JSON.stringify(updatedContact, null, 2));
    if (!updatedContact.name || !updatedContact.phone || !updatedContact.email) {
        logger.warn('The contact ' + JSON.stringify(updatedContact, null, 2) + ' is not well-formed, sending 422...');
        res.status(422).send(); // unprocessable entity
        return;
    }

    try {
        const contacts = await db.find({ name: updatedContact.name });
        if (contacts.length > 0) {
            await db.update({ name: name }, updatedContact);
            logger.debug('Modifying contact with name ' + name + ' with data ' + JSON.stringify(updatedContact, null, 2));
            res.status(204).send(); // no content
        } else {
            logger.warn('There are not any contact with name ' + name);
            res.status(404).send(); // not found
        }
    } catch (err) {
        logger.error('Error getting data from DB', err);
        res.status(500).send(); // internal server error
    }
};


module.exports.deleteContact = async function deleteContact(req, res) {
    var name = req.params.name;
    if (!name) {
        logger.warn('New DELETE request to /contacts/:name without name, sending 400...');
        res.status(400).send(); // bad request
        return;
    }

    logger.info('New DELETE request to /contacts/' + name);
    try {
        var numRemoved = await db.remove({ name: name });
        logger.debug('Contacts removed: ' + numRemoved);
        if (numRemoved === 1) {
            logger.debug('The contact with name ' + name + ' has been succesfully deleted, sending 204...');
            res.status(204).send(); // no content
        } else {
            logger.warn('There are no contacts to delete');
            res.status(404).send(); // not found
        }
    } catch (err) {
        logger.error('Error removing data from DB', err);
        res.status(500).send(); // internal server error
    }
};
