const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const port = 3000;
const endpoint = '/graphql';

const events = [];

app.use(bodyParser.json());
app.use(endpoint, graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event!
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events(args) {
      return events;
    },
    createEvent(args) {
      const { title, description, price, date } = args.eventInput;
      const event = {
        _id: Math.random().toString(),
        title,
        description,
        price,
        date,
      }
      events.push(event);
      return event;
    },
  },
  graphiql: true,
}));

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
