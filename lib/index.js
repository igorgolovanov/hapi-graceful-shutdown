'use strict';

const Hoek = require('@hapi/hoek');
const Joi = require('@hapi/joi');

const internals = {
    schema: Joi.object({
        timeout: Joi.number().integer().positive()
    }),
    defaults: {
        timeout: 10 * 1000
    }
};

internals.extractConfig = function (server, options) {

    const config = Object.assign({}, options, Hoek.reach(server, 'settings.plugins.graceful-shutdown'));

    return Hoek.applyToDefaults(internals.defaults, config);
};

exports.plugin = {
    name: 'graceful-shutdown',
    pkg: require('../package.json'),
    requirements: {
        hapi: '>=17.7.0'
    },
    once: true,
    register: (server, options) => {

        const settings = Joi.attempt(internals.extractConfig(server, options), internals.schema);

        const shutdown = async () => {

            try {

                // wait N seconds for existing connections
                await server.stop({ timeout: settings.timeout });

                process.exit(0);
            }
            catch (e) {

                console.error(e);

                process.exit(1);
            }
        };

        server.events.on('start', () => {

            process.once('SIGTERM', shutdown);
            process.once('SIGINT', shutdown);
        });

        server.events.on('stop', () => {

            process.removeListener('SIGTERM', shutdown);
            process.removeListener('SIGINT', shutdown);
        });
    }
};
