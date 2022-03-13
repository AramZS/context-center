# How to use the eleventy_build workflow

You'll need to create deploy keys. This repo's `.gitignore` file assumes that you will name it `gh-pages` and save it locally. Do not ever commit those files to a public facing repo (or really any repo). Store them.

This process is based on [a post by Lea Tortay](https://www.linkedin.com/pulse/eleventy-github-pages-lea-tortay/).

> You need to create an ACTIONS_DEPLOY_KEY.

> So in your project repo settings tabs, go to Deploy keys on the left menu. In your terminal run this command

> `ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f gh-pages -N ""`

> You will get 2 files gh-pages.pub (public key) and gh-pages (private key).

Set the pub key into https://github.com/YourGithubUN/YourSite/settings/keys/new

And then set the private key in https://github.com/YourGithubUN/YourSite/settings/environments

This repo assumes you'll name your secret key (the one without the `.pub` at the end) `ACTIONS_DEPLOY_KEY`.

Once your first build is complete, you'll need to go to https://github.com/YourGithubUN/YourSite/settings/pages and set the `gh-pages` branch up as your site source, along with the custom domain you want to use and have filled into the CNAME file.
