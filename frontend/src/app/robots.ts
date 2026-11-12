import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const adminLoginPath = process.env.ADMIN_LOGIN_PATH || "/gestao-conliz-acesso";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [adminLoginPath, "/admin", "/api/admin/", "/gestao-conliz-acesso"],
      },
    ],
    sitemap: "https://conliz.com.br/sitemap.xml",
  };
}
