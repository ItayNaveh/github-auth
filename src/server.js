(async() => { if (process.env.NODE_ENV != "production") (await import("dotenv")).config(); })();


import express from "express";
import fetch from "node-fetch";


const PORT = process.env.PORT ?? 3000;
const app = express();

app.use(express.static("public"));


app.get("/auth", async(req, res) => {
	if (req.query.code) {
		// console.log("code", req.query.code);
		const response = await fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: { "Content-Type": "application/json", "Accept": "application/json" },
			body: JSON.stringify({
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code: req.query.code,
			}),
		});
		const data = await response.json();
		// console.log("data", data);

		// console.log("access token", data.access_token);
		const response2 = await fetch("https://api.github.com/user", {
			headers: { "Authorization": `Token ${data.access_token}` }
		});

		const userData = await response2.json();

		res.send(`
		<h1>Signing In...</h1>
		<script>
			if (window.opener) {
				window.opener.postMessage({ user: ${JSON.stringify(userData)} }, "https://github-auth-from-scratch.herokuapp.com/"); //"http://localhost:3000"); //TODO: change the domain
			}
			window.close();
		</script>
		`);
	} else {
		res.json({
			message: "go home",
		});
	}
});


app.listen(PORT, () => {
	console.log(`listening at localhost:${PORT}`);
});