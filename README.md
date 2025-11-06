# TEMPLATE_APPNAME

An initial start point for node.js based applications.

## 📚 Table of Contents

- [🛠 Project Setup Steps](#-project-setup-steps)
  - [1. 📁 Create New GitHub Repository](#1--create-new-github-repository)
  - [2. 🚀 Initialize the Node App](#2--initialize-the-node-app)
  - [3. 🐳 Configure Dockerfile & ⚙️ GitHub Actions](#3--configure-dockerfile--️-github-actions)
  - [4. ☸️ Kubernetes Integration](#4--kubernetes-integration)
  - [5. 📦 Helm Setup in App Repo](#5--helm-setup-in-app-repo)
- [📘 Adding SiteConfig Support](#adding-siteconfig-support)
- [⚙️ Node-build Inputs](#node-build-inputs)
- [🔐 Secrets](#secrets)
- [🐳 Docker standards](#docker)
  - [Dockerfile](#dockerfile)
  - [.dockerignore](#ignore-file)
- [⚙️ Fastify Configuration](#️-fastify-configuration)
  - [maxParamLength](#maxparamlength)
- [🔌 Fastify Plugins](#fastify-plugins)

## 🛠 Project Setup Steps

This is a template repository.

### 1. 📁 Create New GitHub Repository

- Use the [terraform-github](https://github.com/amedia/terraform-github) repo to add a new app.
  Add the module block in the correct main.tf file (a, b, c, etc. based on app name):

```
module "your-repo-name" {
  source      = "../modules/repos/"
  template    = "template-node-app"
  name        = "your-repo-name"
  description = "Short description of the repo"
  whoami = {
    owner            = "team-name"
    system           = []
    availability     = "high"
    confidentiality  = "other"
    integrity        = false
    type             = "service"
    public-channel   = "#public-channel"
    private-channel  = "#private-channel"
  }
}
```

- Read documentation in [Slite](https://amedia.slite.com/app/channels/hOlqx3Miez/notes/BvR9VuE7yg)
  - **Remember to add the template property to the repo definition:** `template = "template-node-app"`

Push a PR and apply the changes.

Then clone or pull the newly created repo.

### 2. 🚀 Initialize the Node App

- Make sure your npm is correctly set up. Make sure you have a npmjs.com user with access to the amedia npm organization, and run `npm login`

```bash
npm install
npm run dev
```

- Open in browser: http://localhost:8080/api/your-app-name/v1/hello?name=your-app-name
- Set the correct port in src/config/config.js and in the Dockerfile
- 🔢 Assign a port: Go to [port-assignments.md in devbox](https://github.com/amedia/devbox/), add your app, and choose an available port
- Update routes in src/routes/router.js

### 3. 🐳 Configure Dockerfile & ⚙️ GitHub Actions

- Update Dockerfile:

```Dockerfile
ENV APPNAME="your-app-name"
ENV PORT="your-app-port"
```

- Update .github/workflows/build.yaml:

```yaml
name: build-app

on:
  push:
    branches:

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  build:
    uses: amedia/github-workflows/.github/workflows/node-build.yaml@node-build-workflow
    with:
      node-version: YOUR_PREFERRED_NODE_VERSION # (e.g. 22.11.0)
      image-name: YOUR_APP_NAME # (e.g. 'article')
      working-directory: packages #Optional. Defaults to root
      eik-publish: true # Optional. Defaults to false
      build: false # Optional. Defaults to true
    secrets:
      gcr-serviceaccount-key: ${{ secrets.GOOGLE_CONTAINER_REGISTRY_SERVICEACCOUNT_KEY }}
      npm-token: ${{ secrets.NPM_TOKEN_READONLY }}
      github-token: ${{ secrets.GITHUB_TOKEN }}
      slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
      eik-server-key: ${{ secrets.EIK_SERVER_KEY }} # Only needed if eik-publish is true
```

### 4. ☸️ Kubernetes Integration

- Go to the appropriate [k8s env folder](https://github.com/amedia/k8s-objects/tree/master/helm/values/app-generator) (e.g. production, snap0).

- Add your app to repos.yaml:

```yaml
your-app-name: {}
```

- Push a PR.

### 5. 📦 Helm Setup in App Repo

Create a helm/ folder at the root, then add a default.yaml:

```yaml
---
deployment:
  useEnvironment:
    literal:
      your-app-env: ''

  probes:
    liveness:
      path: /your-app-name/apiadmin/ping
    readiness:
      path: /your-app-name/apiadmin/ping

endpoints:
  http:
    enabled: true
    ingress:
      enabled: true
    port: 8080
    varnish:
      enabled: true
      staleIfErrorOn: 500,502,503

mesh:
  enabled: true

roleBindings:
  deployer: true

environmentDefinitions:
  literal:
    your-app-env:
      HOST: 0.0.0.0
```

Then create additional [env].yaml files (e.g. snap0.yaml, production.yaml) as needed.

> **_Note:_** The app defaults to binding to `::` (HOST variable) in src/config.js. In development.json the HOST variable binds to `localhost`. It is not advised to bind to `::` or `0.0.0.0` locally as this opens up an attack vector for malicious actors. Similarly, it is not useful to bind to `localhost`, `127.0.0.1`, or `::1` in a production environment as the service will not be reachable outside the Pod it lives in.

#### Adding SiteConfig support

See module [documentation](https://github.com/amedia/node-site-config)

#### Node-build inputs

| Name                | Description                      | Required | Default |
| ------------------- | -------------------------------- | -------- | ------- |
| `image-name`        | Name of the image to be built    | ✅       |         |
| `node-version`      | Node version for the build       | ✅       |         |
| `working-directory` | Directory with `package.json`    | ❌       | `.`     |
| `eik-publish`       | Publish to Eik                   | ❌       | `false` |
| `build`             | Run `npm run build` before build | ❌       | `true`  |

#### Secrets

| Name                     | Description                          | Required                  |
| ------------------------ | ------------------------------------ | ------------------------- |
| `gcr-serviceaccount-key` | Google Cloud Run service account key | ✅                        |
| `npm-token`              | NPM authentication token             | ✅                        |
| `github-token`           | GitHub token                         | ✅                        |
| `slack-bot-token`        | Slack Bot token                      | ✅                        |
| `eik-server-key`         | Eik server auth key (if publishing)  | ✅ if `eik-publish: true` |

#### Docker standards

The container layout is based on best practices for Node dockerfiles.

Following are sources that motivate the standardization around this layout:

- [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Snyk Node Docker best practices](https://snyk.io/wp-content/uploads/10-best-practices-to-containerize-Node.js-web-applications-with-Docker.pdf)
- [Nodejs.org Creating a dockerfile](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/#creating-a-dockerfile)
- [Node.js Docker best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Adam Brodziak Dockerfile best practices](https://adambrodziak.pl/dockerfile-good-practices-for-node-and-npm)

#### Dockerfile

The container layout contains the following:

- The `NODE_VERSION` is set by the `node-version` input to the Node-build workflow (see above [Node Build workflow inputs](#node-build-inputs))
- The `APPNAME` environment variable is set to the name of the application. This is used for logging purposes.
- The `NODE_ENV` environment variable is set to `production`. This is used to ensure that the correct dependencies are installed.
- The working directory is set to `/usr/src/app`. This is the standard working directory for Node applications.
- The user is set to `node`. This is the standard user for Node applications, and avoids running the container as root.
- The `COPY --chown=node:node . .` copies all files from the root context into the image. See the [`.dockerignore`-file](#ignore-file) for details on what is copied over.
- The `HOST` variable controls what address the application is bound to. `::` is used by default to ensure that healthchecks in k8s works.
- The `PORT` variable controls what port the application is bound to.
- The `ENTRYPOINT` is set to `node`. This is a security measure that prevents illegal manual `docker run` commands.
- The `CMD` is configurable per container, and can be overridden with a custom `docker run`.

> **Warning** **If there is a build step required, this should be done in the CI/CD pipeline and the resulting build should be copied into the container if needed.**

#### Ignore-file

> **Warning** **Ignore the advice below at your own peril.**

`.dockerignore` is `opt-out` this means that you need to at all times be wary of which files are transferred to the docker image. E.g. the ignore file does not include `.env`, `.npmrc`, or `gcloud.json`. If you were to include secrets in the repository make sure they are also part of the image ignore file.


### ⚙️ Fastify Configuration

#### `maxParamLength`

The `maxParamLength` option in Fastify is used to define the maximum length of route parameters (e.g., dynamic segments in the URL). This option is set globally when creating the Fastify instance and cannot be configured on a per-route basis.
If the option is not set, the default value is 100 characters.

If you need to enforce different parameter length limits for specific routes, you can implement custom validation logic within those routes. For example, you can use Fastify's schema validation or middleware to handle such constraints.

Example of setting `maxParamLength` globally:

```javascript
const fastify = Fastify({
  routerOptions: {
    maxParamLength: 200, // Sets the maximum parameter length globally
  }
});
```

### Fastify Plugins

#### [@fastify/etag](https://www.npmjs.com/package/@fastify/etag)

ETags are used by browsers to check if a file is up to date. We use weak ETags by default as they are faster to generate, but they are less reliable for cache validation.
([see mdn for more on etags](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag))
