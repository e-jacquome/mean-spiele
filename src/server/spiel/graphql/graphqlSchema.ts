import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

export const graphqlSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
