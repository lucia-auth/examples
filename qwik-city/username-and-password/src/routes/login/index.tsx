import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  type DocumentHead,
  routeAction$,
  zod$,
  z,
  Form,
  Link,
} from "@builder.io/qwik-city";
import { auth } from "~/lib/lucia";
import { LuciaError } from "lucia";

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  if (session) {
    throw event.redirect(303, "/");
  }

  return {};
});

export const useLoginAction = routeAction$(
  async (values, event) => {
    const authRequest = auth.handleRequest(event);

    try {
      // find user by key
      // and validate password
      const key = await auth.useKey(
        "username",
        values.username.toLowerCase(),
        values.password,
      );

      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });
      authRequest.setSession(session); // set session cookie
    } catch (e) {
      if (
        e instanceof LuciaError &&
        (e.message === "AUTH_INVALID_KEY_ID" ||
          e.message === "AUTH_INVALID_PASSWORD")
      ) {
        // user does not exist
        // or invalid password
        return event.fail(400, {
          message: "Incorrect username or password",
        });
      }
      return event.fail(500, {
        message: "An unknown error occurred",
      });
    }

    throw event.redirect(303, "/");
  },
  zod$({
    username: z.string(),
    password: z.string(),
  }),
);

export default component$(() => {
  const loginAction = useLoginAction();
  return (
    <>
      <Form action={loginAction} class="form-control mx-auto mt-32 max-w-lg">
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
          Login
        </button>

        <p class="py-4">
          Dont have an account?{" "}
          <Link href="/signup" class="link-primary">
            Signup
          </Link>
        </p>

        {loginAction.value?.message && (
          <p class="font-bold text-error">{loginAction.value.message}</p>
        )}
      </Form>
    </>
  );
});

export const head: DocumentHead = {
  title: "Login Page",
  meta: [
    {
      name: "description",
      content: "This is the login page",
    },
  ],
};
