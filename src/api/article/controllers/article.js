"use strict";

/**
 *  article controller
 */

// INITIAL
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::article.article");
