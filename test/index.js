'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const GracefulShutdown = require('..');

// Test shortcuts

const lab = exports.lab = Lab.script();
const { describe, it } = lab;
const expect = Code.expect;


const internals = {};


describe('GracefulShutdown', () => {

    it('should subscribe to SIGTERM event when server started', async () => {

        const server = await internals.prepareServer();
        const counter = process.listenerCount('SIGTERM');
        await server.start();

        expect(process.listenerCount('SIGTERM')).to.be.equal(counter + 1);

        await server.stop();
    });

    it('should subscribes to SIGINT event when server started', async () => {

        const server = await internals.prepareServer();
        const counter = process.listenerCount('SIGINT');
        await server.start();

        expect(process.listenerCount('SIGINT')).to.be.equal(counter + 1);

        await server.stop();
    });

    it('should unsubscribes from SIGTERM event when server stopped', async () => {

        const server = await internals.prepareServer();
        await server.start();
        const counter = process.listenerCount('SIGTERM');
        await server.stop();

        expect(process.listenerCount('SIGTERM')).to.be.equal(counter - 1);
    });

    it('should unsubscribes from SIGINT event when server stopped', async () => {

        const server = await internals.prepareServer();
        await server.start();
        const counter = process.listenerCount('SIGINT');
        await server.stop();

        expect(process.listenerCount('SIGINT')).to.be.equal(counter - 1);
    });
});

internals.prepareServer = async function () {

    const server = Hapi.server();
    await server.register({
        plugin: GracefulShutdown,
        options: {
            timeout: 10
        }
    });
    return server;
};
