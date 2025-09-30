export const rootResolver = {
    products: async (args, context) => {
        console.log('products resolver called with context:', !!context, !!context?.productAPI);
        return context.productAPI.list(args.search);
    },
    product: async (args, context) => {
        return context.productAPI.get(args.id);
    },
    ordersByUser: async (args, context) => {
        // En un escenario real, verificar que args.userId === context.userId o rol autorizado
        return context.orderAPI.listByUser(args.userId);
    },
    createOrder: async (args, context) => {
        // Validación básica de autorización (placeholder)
        if (context.userId && context.userId !== args.input.userId) {
            throw new Error('FORBIDDEN_USER_MISMATCH');
        }
        return context.orderAPI.create(args.input);
    },
};
