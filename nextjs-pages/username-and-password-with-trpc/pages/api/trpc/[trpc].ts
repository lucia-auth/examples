/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from "@trpc/server/adapters/next";
import { protectedProcedure, router } from "@/server/trpc";
import { createContext } from "@/server/context";

const appRouter = router({
	me: protectedProcedure.query(({ ctx }) => {
		return ctx.session;
	})
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext
});
