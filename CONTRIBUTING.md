# 🤝 Contributing to דאטאבוס

Welcome 👋 and thank you for considering contributing to **דאטאבוס**, a project by [Hasadna](https://open-bus-map-search.hasadna.org.il)!  
We’re excited to have you on board.

## 🧭 Where to Start

- Browse [open issues](https://github.com/hasadna/open-bus-map-search/issues)
- Start easy: look for the [“Good First Issue” label](https://github.com/hasadna/open-bus-map-search/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- Want impact? Choose from our [milestones](https://github.com/hasadna/open-bus-map-search/milestones)

🙋 Have feedback or spotted something unclear? [Open an issue](https://github.com/hasadna/open-bus-map-search/issues).

## ⚡ Running the Project

You can run the project:

- 🖥️ **Locally** (recommended for repeat contributors)
- 🌐 **In Gitpod** (ready-to-code environment in your browser) → [Open in Gitpod](https://gitpod.io/#https://github.com/hasadna/open-bus-map-search)

### Local Setup

1. **Do NOT fork** – instead, request write access (so previews & CI run correctly).
2. Clone:

```bash
git clone https://github.com/hasadna/open-bus-map-search.git
cd open-bus-map-search
```

3. Install dependencies:

```bash
npm install
```

4. Run locally:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## 📌 Pull Requests

1. Create a branch (name it after the issue/feature, e.g., `feat/add-close-button`)
2. Commit with a [conventional message](#-commit-message-conventions)
3. Push & open a PR → tag a maintainer as reviewer
4. Ensure it runs locally before submitting

🔗 [PR tutorial for beginners](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

## 📝 Commit Message Conventions

| Type       | Usage Example                              |
| ---------- | ------------------------------------------ |
| `feat`     | `feat: add modal component`                |
| `fix`      | `fix: make close button visible on mobile` |
| `docs`     | `docs: update README with new info`        |
| `refactor` | `refactor: split App into subcomponents`   |
| `chore`    | `chore: upgrade React to v18`              |
| `test`     | `test: add integration tests`              |
| `style`    | `style: remove empty line`                 |

## 🧪 Testing

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `npm run test`            | Run Jest + Playwright tests (excluding visual tests)        |
| `npm run test:unit`       | Run Jest unit tests                                         |
| `npm run test:unit:ci`    | Run Jest with coverage                                      |
| `npm run test:e2e`        | Run Playwright end-to-end tests                             |
| `npm run test:e2e:ui`     | Run Playwright tests with interactive UI                    |
| `npm run test:e2e:visual` | Run visual regression tests with (Playwright + Applitools ) |
| `npm run test:storybook`  | Run Storybook visual tests with (Applitools)                |

More: [Playwright CLI](https://playwright.dev/docs/test-cli)

## 📚 Resources

- 🎨 [Figma design file](https://www.figma.com/file/Plw8Uuu6U96CcX5tJyRMoW/Public-Transportation-visual-informaiton)
- 🗄️ [Data model schema](https://github.com/hasadna/open-bus-stride-db/blob/main/DATA_MODEL.md)
- 📖 [API docs (Swagger)](https://open-bus-stride-api.hasadna.org.il/docs)
- 🌍 [Deployed website](https://open-bus-map-search.hasadna.org.il/dashboard)

📺 Tutorials:

- [Dashboard & Maps walkthrough](https://www.youtube.com/watch?v=MJZrIxjQEH8&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&t=17s)
- [Bug reporting guide](https://www.youtube.com/watch?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T)

## 🆘 Troubleshooting

We’re here to help! Join our [Slack](https://join.slack.com/t/hasadna/shared_invite/zt-21qipktl1-7yF4FYJVxAqXl0wE4DlMKQ).

## ❓ FAQ

**Why is my commit marked ❌ red?**

- 🧹 Lint error → run `npm run lint:fix`
- 🧪 Test error → run `npm run test:unit:ci`
- 🏗️ Build error → run `npm run build`
- 📝 Invalid PR title → use conventional commit style (`feat: …`, `fix: …`)
