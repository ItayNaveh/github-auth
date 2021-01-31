import { createApp, ref } from "https://unpkg.com/vue@3.0.5/dist/vue.esm-browser.js";

createApp({
	setup() {
		const signedIn = ref(false);
		const userData = ref(null);

		const signIn = async() => {
			window.addEventListener("message", async(e) => {
				if (e.origin != "https://github-auth-from-scratch.herokuapp.com") { // "http://localhost:3000") {
					console.log("invalid origin", e.origin);
				} else {
					console.log("dooooooo");
					userData.value = e.data;
					signedIn.value = true;
				}
			}, { once: true });
			window.open("https://github.com/login/oauth/authorize?client_id=089eb473578a8e68344e");
		};

		return {
			signedIn,
			signIn,
			userData,
		};
	}
}).mount("#app");
