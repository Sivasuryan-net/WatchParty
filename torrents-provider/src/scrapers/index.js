// Export all scrapers
const scrapers = {
    'yts': require('./yts'),
    'piratebay': require('./piratebay')
};

module.exports = scrapers;
