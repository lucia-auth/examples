import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { auth } from "~/lib/lucia";

export const useUserLoader = routeLoader$(async (event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();
  if (!session) {
    throw event.redirect(303, "/login");
  }

  return session.user;
});

export const useLogoutUserAction = routeAction$(async (values, event) => {
  const authRequest = auth.handleRequest(event);
  const session = await authRequest.validate();

  if (!session) throw event.redirect(302, "/login");

  await auth.invalidateSession(session.sessionId);
  authRequest.setSession(null);
  throw event.redirect(302, "/login");
});

export default component$(() => {
  const userLoader = useUserLoader();
  const logoutUserAction = useLogoutUserAction();
  return (
    <div class="m-8">
      <pre>
        <code>{JSON.stringify(userLoader.value, null, 2)}</code>
      </pre>
      <h1>Protected Page</h1>
      <h1 class="text-3xl">
        if you see this, it means that you have successfully authenticated
      </h1>

      <Form action={logoutUserAction}>
        <button class="btn btn-error" type="submit">
          Logout
        </button>
      </Form>
    </div>
  );
});
