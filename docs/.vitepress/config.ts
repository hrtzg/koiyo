import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Koiyo",
	description: "Minimal TypeScript framework for building AI agents 🎏",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Getting Started", link: "/getting-started" },
			{ text: "Examples", link: "/api-examples" },
		],

		sidebar: [
			{
				text: "Getting Started",
				items: [{ text: "Introduction", link: "/getting-started" }],
			},
			{
				text: "Core Concepts",
				items: [
					{ text: "Agents", link: "/core-concepts/agents" },
					{ text: "Workers", link: "/core-concepts/workers" },
					{ text: "Tools", link: "/core-concepts/tools" },
					{ text: "Conversations", link: "/core-concepts/conversations" },
				],
			},
			{
				text: "Guides",
				items: [{ text: "Models", link: "/models" }],
			},
			{
				text: "Examples",
				items: [{ text: "Code Examples", link: "/api-examples" }],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/koiyo/koiyo" },
		],
	},
});
