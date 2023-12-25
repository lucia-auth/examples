import type { User } from "lucia";

export const useUser = () => {
	const user = useState<User | null>("user", () => null);
	return user;
};

export const useAuthenticatedUser = () => {
	const authenticatedUser = useUser()

	if (!authenticatedUser.value) {
		throw createError("useAuthenticatedUser() can only be used in protected pages");
	}
	
	const user = ref(toRaw(authenticatedUser.value))
	
	watch(authenticatedUser, async (authenticatedUser) => {
		if (!authenticatedUser) {
			await navigateTo('/login')
			return
		}

		user.value = authenticatedUser;
	})
	
	return user
};
