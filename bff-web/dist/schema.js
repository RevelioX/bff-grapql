import { buildSchema } from 'graphql';
export const schema = buildSchema(`
  type Product {
    _id: ID!
    nombre: String!
    descripcionCorta: String
    precio: Float!
    stock: Int!
  }

  type OrderItem {
    productId: ID!
    cantidad: Int!
  }

  type Order {
    _id: ID!
    userId: String!
    items: [OrderItem!]!
    total: Float!
    createdAt: String!
  }

  input CreateOrderItemInput {
    productId: ID!
    cantidad: Int!
  }

  input CreateOrderInput {
    userId: String!
    items: [CreateOrderItemInput!]!
    direccionEnvio: String
  }

  type Query {
    products(search: String): [Product!]!
    product(id: ID!): Product
    ordersByUser(userId: String!): [Order!]!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
  }
`);
