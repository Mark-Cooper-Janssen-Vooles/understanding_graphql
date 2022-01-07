// all logic related to express server

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // allows us to make queries against our development server
}));

app.listen(4000, () => {
  console.log('Listening');
});