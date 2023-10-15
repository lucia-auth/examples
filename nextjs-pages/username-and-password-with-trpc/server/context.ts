import { auth } from "@/auth/lucia";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";


export const createContext = async(opts: CreateNextContextOptions) => {
    const authRequest = auth.handleRequest({req: opts.req, res: opts.res});
    const lucia_session = await authRequest.validate();
    if (!lucia_session) {
        return {
            session: null
        }
    }

    return {
      session: lucia_session
    }
}

export type typeCreateContext = typeof createContext;