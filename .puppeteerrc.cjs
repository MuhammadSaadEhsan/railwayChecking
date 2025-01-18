const {join} = require('path');
process.env.PUPPETEER_CACHE_DIR = '/app/.cache/puppeteer';

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};