module.exports = (info) => {
	//console.log("Global Site Data", info);
	const site_data = {
		lang: "en-US",
		github: {
			build_revision: process.env.MY_GITHUB_RUN_ID || 1.0,
			build_sha: process.env.GITHUB_SHA || 1,
		},
		site_url: process.env.DOMAIN,
		site_domain: process.env.DOMAIN_NAME,
		site_name: process.env.SITE_NAME,
		description: process.env.DESCRIPTION,
		featuredImage: process.env.BASIC_IMAGE,
		author: process.env.PRIMARY_AUTHOR,
		authorPhoto:
			"https://raw.githubusercontent.com/AramZS/aramzs.github.io/master/_includes/Aram-Zucker-Scharff-square.jpg",
	};
	//console.log("Created Site Data", site_data);
	return site_data;
};
