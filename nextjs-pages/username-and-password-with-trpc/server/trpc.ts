/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */
import { TRPCError, initTRPC } from '@trpc/server';
import { typeCreateContext } from './context';

const t = initTRPC.context<typeCreateContext>().create();

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

export const router = t.router;
export const middleware = t.middleware;

/**
 * Protected procedure
 **/
const isAuthed = t.middleware((opts) => {
    const { ctx } = opts;
    if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return opts.next({
        ctx: {
            session: ctx.session,
        },
    });
});

export const protectedProcedure = t.procedure.use(isAuthed);
