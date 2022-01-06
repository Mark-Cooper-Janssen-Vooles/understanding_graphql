finished code can be found here: https://github.com/StephenGrider/GraphQLCasts


# GraphQL and Apollo

- What is graphQL
- A REST-ful routing primer
- On to GraphQL
- Fetching Data with Queries
- The GraphQL Ecosystem
- Clientside GraphQL
- Gotchas with Queries in React 
- Frontend mutations
- Automatic Data Caching
- React Router + GraphQL
- More on Client side Mutations
- Building from (Mostly) scratch
- Moving Client side 
- Handling Errors Gracefully
- Extras



### What is graphQL

tldr:
GraphQL lets you ask for what you want in a single query, saving bandwidth and reducing waterfall requests. It also enables clients to request their own unique data specifications.

longer version: 
Before there was GraphQL, there was REST.

In recent years, REST has become the dominant API style for building backend web services. With REST, you could signal the type of request we want to make (ex: GET, POST, PUT, or DELETE) and the resource we’d like to fetch or interact with (ex: /api/pets/1) using an HTTP method and a URL.

GraphQL has strictly-typed interfaces where REST APIs have much looser ones.

It’s a great approach (and one we initially used at StockX for several years). But REST comes with some downsides like:

Over-fetching
Multiple requests for multiple resources
Waterfall network requests on nested data
Each client need to know the location of each service
Then came GraphQL: a server-side runtime and query language for your API.