import { JSDOM } from 'jsdom';
import * as chai from 'chai';
import 'mock-local-storage';

// Setup Mock DOM
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = window.localStorage;

// Setup Global Chai (for tests expecting window.chai or implicit chai)
global.window.chai = chai;
global.expect = chai.expect;

// Polyfill other globals if needed by tests
global.navigator = {
    userAgent: 'node.js'
};
