const { createCoreController } = require("@strapi/strapi/lib/factories");
const {
  default: entityService,
} = require("@strapi/strapi/lib/services/entity-service");

const populateAttribute = (attr) => {
  const { components, repeatable } = attr;
  if (components) {
    const populate = components.reduce((currentValue, current) => {
      const [componentDir, componentName] = current.split(".");

      /* Component attributes needs to be explicitly populated */
      const componentAttributes = Object.entries(
        require(`../components/${componentDir}/${componentName}.json`)
          .attributes
      );
      /** Implemented media type */
      const attrPopulates = componentAttributes
        .filter(([, v]) => {
          return ["component", "media"].includes(v.type);
        })
        .reduce((acc, [curr, obj]) => {
          switch (obj.type) {
            case "component":
              return { ...acc, [curr]: { populate: "*" } };
            case "media":
              return { ...acc, [curr]: "*" };
          }
        }, {});

      return {
        ...currentValue,
        [current.split(".").pop()]: { populate: "*" },
        ...attrPopulates,
      };
    }, {});

    return { populate };
  } else if (repeatable) {
    const componentName = attr.component.split(".")[1];
    const populate = { [componentName]: { populate: "*" } };
    return { populate };
  }
  return { populate: "*" };
};

const getPopulateFromSchema = function (schema) {
  return Object.keys(schema.attributes).reduce((currentValue, current) => {
    const attribute = schema.attributes[current];
    if (!["dynamiczone", "component"].includes(attribute.type)) {
      return { [current]: populateAttribute(attribute) };
    }
    return {
      ...currentValue,
      [current]: populateAttribute(attribute),
    };
  }, {});
};

function createPopulatedController(uid, schema) {
  return createCoreController(uid, () => {
    return {
      async find(ctx) {
        // deeply populate all attributes with ?populate=*, else retain vanilla functionality
        if (ctx.query.populate === "*") {
          ctx.query = {
            ...ctx.query,
            populate: getPopulateFromSchema(schema),
          };
        }
        return await super.find(ctx);
      },
      async findOne(ctx) {
        if (ctx.query.populate === "*") {
          ctx.query = {
            ...ctx.query,
            populate: getPopulateFromSchema(schema),
          };
        }
        return await super.findOne(ctx);
      },
    };
  });
}

module.exports = createPopulatedController;
