import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

function setupSwagger(app) {
  const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Swagger EducaBlog",
        version: "1.0.0",
        description: "Documentação da API EducaBlog",
      },
      servers: [{ url: "/", description: "Servidor atual" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    apis: ["./app.js", "./src/**/*.js"],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.get("/swagger.json", (_req, res) => res.json(swaggerSpec));
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true }),
  );
}

export default setupSwagger;
