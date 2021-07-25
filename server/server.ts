import { GraphQLServer, PubSub } from 'graphql-yoga';

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

  type Subscription {
    messages: [Message!]
  }
`;

const subscribers: Function[] = [];
const onMessagesUpdate = (fn: Function) => subscribers.push(fn);

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent: any, message: Message): number => {
      const id = messages.length;
      messages.push({
        id,
        user: message.user,
        content: message.content,
      });
      subscribers.forEach((fn: Function) => fn());
      return id;
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent: any, args: any, { pubsub }: any) => {
        const channel = Math.random().toString(36).slice(2, 15);
        onMessagesUpdate(() => pubsub.publish(channel, { messages }));
        setTimeout(() => pubsub.publish(channel, { messages }), 0);
        return pubsub.asyncIterator(channel);
      },
    },
  },
};

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.start(({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
});
