const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema
} = graphql;

// important you define companyType above userType
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
})

const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: {
    id: { type: GraphQLString},
    firstName: { type: GraphQLString},
    age: { type: GraphQLInt},
    company: { 
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${parentValue.companyId}`)
          .then(res => res.data);
      } 
    }
  }
});

const RootQuery = new GraphQLObjectType({ 
  name: 'RootQueryType', 
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) { 
        return axios.get(`http://localhost:3030/users/${args.id}`)
          .then(response => response.data);
      }
    },
    company: { // we can add a company field just like we added a user
      type: CompanyType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${args.id}`)
          .then(response => response.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});