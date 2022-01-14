const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({ // wrapping fields with an arrow function turns fields object into an arrow function that returns an object, meaning function gets defined but not executed until after entire file has been read 
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), // we need to tell graphQL that it'll be expecting a list of users
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3030/companies/${parentValue.id}/users`)
          .then(res => res.data);
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User', 
  fields: () => ({
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
  })
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

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return axios.post(`http://localhost:3030/users/`, { firstName, age })
          .then(res => res.data);
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3030/users/${id}`)
          .then(res => res.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLInt }
      },
      resolve(parentValue, { id, firstName, age, companyId }) {
        return axios.patch(`http://localhost:3030/users/${id}`, { firstName, age, companyId })
          .then(res => res.data);
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});