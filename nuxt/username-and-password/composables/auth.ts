import type { User } from "lucia";

const useSessionState = () => useState<UserQuery['user'] | null>('user', () => null)

export const useUser = () => {
	const user = useSessionState()
	return user;
};

export const useAuthenticatedUser = () => {
	const user = useUser();
	return computed(() => {
		const userValue = unref(user);
		if (!userValue) {
			throw createError("useAuthenticatedUser() can only be used in protected pages");
		}
		return userValue;
	});
};
