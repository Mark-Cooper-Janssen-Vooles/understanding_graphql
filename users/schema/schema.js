const graphql = require('graphql');
const _ = require('lodash');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema
} = graphql;

const users = [
  { id: '23', firstName: 'Bill', age: 20 },
  { id: '47', firstName: 'Samantha', age: 21}
];

const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: {
    id: { type: GraphQLString},
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt}
  }
});

const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        // lodash walks through list of users, and finds and returns the first user with an id or args.id
        return _.find(users, { id: args.id });
      }
    }
  }
});

// graphQLSchema takes in a rootQuery and returns a graphQL schema instance 
module.exports = new GraphQLSchema({
  query: RootQuery
});