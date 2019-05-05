const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const { connect } = require('mongoose');
const Event = require('./models/event');

const app = express();

const endpoint = '/graphql';
const port = 3000;
const mongoDBUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@event-booking-gjxen.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`

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
    async events(args) {
      try {
        const events = await Event.find();
        return events.map(event => ({...event._doc}));
      } catch(error) {
        throw new Error(error);
      }
    },
    async createEvent(args) {
      try {
        const { title, description, price, date } = args.eventInput;
        const event = new Event({
          title,
          description,
          price,
          date: new Date(date)
        });
        const savedEvent = await event.save();
        return {...savedEvent._doc};
      } catch(error) {
        throw new Error(error);
      }
    }
  },
  graphiql: true,
}));

connect(mongoDBUrl)
  .then(() => {
    app.listen(port, () => console.log(`\nDevelopment server started on http://localhost:${port}`));
  })
  .catch((error) => {
    throw new Error(error);
  });
