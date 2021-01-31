import { Application, Router, RouterContext, ContextSendOptions } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

const render = async(ctx: RouterContext<Record<string | number, string | undefined>, Record<string, any>>, file: string, options?: ContextSendOptions) => await ctx.send({ root: `${Deno.cwd()}/public`, path: file, ...options });


router.get("/", async(ctx) => {
	await render(ctx, "index.html");
});

router.get("/app.js", async(ctx) => {
	ctx.response.type = "text/javascript";
	ctx.response.body = await Deno.readFile("public/app.js");
});

router.get("/auth", async(ctx) => {
	const code = ctx.request.url.searchParams.get("code");
	if (code) {
		const response = await fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: { "Content-Type": "application/json", "Accept": "application/json" },
			body: JSON.stringify({
				client_id: Deno.env.get("GITHUB_CLIENT_ID"),
				client_secret: Deno.env.get("GITHUB_CLIENT_SECRET"),
				code: code,
			}),
		});
		const data = await response.json();
		// console.log("data", data);

		// console.log("access token", data.access_token);
		const response2 = await fetch("https://api.github.com/user", {
			headers: { "Authorization": `Token ${data.access_token}` }
		});

		const userData = await response2.json();

		ctx.response.type = "text/html";
		ctx.response.body = `
			<h1>Signing In...</h1>
			<script>
				if (window.opener) {
					window.opener.postMessage({ user: ${JSON.stringify(userData)} }, "https://github-auth-from-scratch.herokuapp.com"); // "http://localhost:3000");
				}
				window.close();
			</script>
		`;
	} else {
		ctx.response.body = {
			message: "Go Home",
		};
	}
});


app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port }) => console.log(`Listening at ${hostname ?? "localhost"}:${port}`));

const PORT = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 3000;
await app.listen({ port: PORT });
