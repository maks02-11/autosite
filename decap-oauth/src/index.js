export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // STEP 1 — redirect to GitHub
    if (url.pathname === "/api/auth") {
      const redirect =
        "https://github.com/login/oauth/authorize" +
        `?client_id=${env.GITHUB_CLIENT_ID}&scope=repo`;

      return Response.redirect(redirect, 302);
    }

    // STEP 2 — GitHub callback
    if (url.pathname === "/api/auth/callback") {
      const code = url.searchParams.get("code");

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await tokenRes.json();

      return new Response(
        `<script>
          window.opener.postMessage(
            'authorization:github:success:${data.access_token}',
            '*'
          );
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
