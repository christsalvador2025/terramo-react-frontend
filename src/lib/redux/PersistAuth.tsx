
// import { getCookie } from "cookies-next";
import { getCookie } from "cookies-next";
import { useAppDispatch } from "./hooks/typedHooks";
import { useEffect } from "react";
import { setLogout, setUserData } from "./features/auth/authSlice";

export default function PersistAuth() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		

		const isLoggedIn = getCookie("logged_in") === "true";
		const getUser = JSON.parse(getCookie("user") || "{}");
		if (isLoggedIn) {
			// dispatch(setAuth());

		dispatch(
			setUserData({
			user: getUser
			})
		);

		} else {
			dispatch(setLogout());
		}
	}, [dispatch]);

	return null;
}