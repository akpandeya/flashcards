import { JSDOM } from 'jsdom';
import * as chai from 'chai';
import 'mock-local-storage';

// Setup Mock DOM
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;

// mock-local-storage already sets global.localStorage
// We just need to ensure window.localStorage uses it if we want consistancy, 
// OR just rely on JSDOM's internal or the global one.
// The error was: Cannot assign to read only property 'localStorage'.
// Let's rely on the global one for "localStorage" usage in modules.
// And if app uses window.localStorage, we might need to patch window.
Object.defineProperty(window, 'localStorage', {
    value: global.localStorage,
    configurable: true,
    writable: true
});

// Setup Global Chai (for tests expecting window.chai or implicit chai)
global.window.chai = chai;
global.expect = chai.expect;

// Polyfill navigator if needed
if (!global.navigator) {
    global.navigator = {
        userAgent: 'node.js'
    };
} else {
    // If it exists but we need to patch it (unlikely in pure Node unless JSDOM did it?)
}
