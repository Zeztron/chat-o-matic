import { GraphQLServer } from 'graphql-yoga';

interface Message {
  id: number;
  user: string;
  content: string;
}

const messages: Message[] = [];

const typeDefs = `
  type Message {
    id: ID!
    user: String!
    content: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, content: String!): ID!
  }
`;

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent: any, message: Message) => {
      const id = messages.length;
      messages.push({
        id,
        user: message.user,
        content: message.content,
      });
      return id;
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });

server.start(({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
});
