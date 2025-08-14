
// import { getCookie } from "cookies-next";
import { getCookie } from "cookies-next";
import { useAppDispatch } from "./hooks/typedHooks";
import { useEffect } from "react";
import { setAuth, setLogout } from "./features/auth/authSlice";

export default function PersistAuth() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const isLoggedIn = getCookie("logged_in") === "true";
		if (isLoggedIn) {
			dispatch(setAuth());
		} else {
			dispatch(setLogout());
		}
	}, [dispatch]);

	return null;
}