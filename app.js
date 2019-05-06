const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { connect } = require('mongoose');
const graphQLSchema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();

const endpoint = '/graphql';
const port = 3000;
const mongoDBUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@event-booking-gjxen.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`

app.use(bodyParser.json());
app.use(endpoint, graphqlHttp({
  schema: graphQLSchema,
  rootValue: resolvers,
  graphiql: true,
}));

connect(mongoDBUrl)
  .then(() => {
    app.listen(port, () => console.log(`\nDevelopment server started on http://localhost:${port}`));
  })
  .catch((error) => {
    throw new Error(error);
  });
