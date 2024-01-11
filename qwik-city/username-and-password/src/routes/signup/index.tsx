import { component$ } from "@builder.io/qwik";
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  routeLoader$,
  Link,
} from "@builder.io/qwik-city";
import { auth } from "~/lib/lucia";
import { SqliteError } from "better-sqlite3";

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  if (session) {
    throw event.redirect(303, "/");
  }

  return {};
});

export const useSignupUser = routeAction$(
  async (values, event) => {
    try {
      const authRequest = auth.handleRequest(event);
      const user = await auth.createUser({
        key: {
          providerId: "username", // auth method
          providerUserId: values.username.toLowerCase(), // unique id when using "username" auth method
          password: values.password, // hashed by Lucia
        },
        attributes: {
          username: values.username,
        },
      });
      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      authRequest.setSession(session); // set session cookie
    } catch (e) {
      // check for unique constraint error in user table
      if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return event.fail(400, {
          message: "Username already taken",
        });
      }
      return event.fail(500, {
        message: "An unknown error occurred",
      });
    }

    // redirect to
    // make sure you don't throw inside a try/catch block!
    throw event.redirect(303, "/");
  },
  zod$({
    username: z.string().min(2),
    password: z.string().min(5),
  }),
);

export default component$(() => {
  const signupUserAction = useSignupUser();
  return (
    <>
      <Form
        action={signupUserAction}
        class="form-control mx-auto mt-32 max-w-lg"
      >
        <label for="username" class="label">
          Username
        </label>
        <input id="username" name="username" class="input bg-base-200" />

        <label for="password" class="label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          class="input bg-base-200"
        />

        <button type="submit" class="btn btn-primary my-2">
          Signup
        </button>

        <p class="py-4">
          Already have an account?{" "}
          <Link href="/login/" class="link-primary">
            Login
          </Link>
        </p>

        {signupUserAction.value?.message && (
          <p class="font-bold text-error">{signupUserAction.value.message}</p>
        )}
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: "Signup Page",
  meta: [
    {
      name: "description",
      content: "This is the signup page",
    },
  ],
};
