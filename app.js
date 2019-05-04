const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');

const app = express();
const port = 3000;
const endpoint = '/graphql';
const mongoURL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@event-booking-gjxen.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`;

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
      return Event.find()
        .then((events) => {
          return events.map(event => ({...event._doc}));
        })
        .catch((error) => {
          throw new Error(error);
        })
    },
    createEvent(args) {
      const { title, description, price, date } = args.eventInput;
      const event = new Event({
        title,
        description,
        price, 
        date: new Date(date),
      })
      return event.save()
        .then((result) => {
          console.log('result', result);
          return {...result._doc};
        })
        .catch((err) => {
          console.log('error', err);
          throw new Error(err);
        });
    },
  },
  graphiql: true,
}));

mongoose.connect(mongoURL)
  .then(() => {
    app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
  }).catch((err) => {
    console.log('woah', err);
  });
