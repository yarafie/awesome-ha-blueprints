# Contributing

The goal of this project is to keep a curated collection of blueprints for Home Assistant entirely maintained by the community. Therefore, any contribution to this project is highly appreciated and welcomed! :rocket:

Please consider that this project is released under the [GPL-3.0 License](https://github.com/yarafie/awesome-ha-blueprints/blob/main/LICENSE), and any discussion or interaction must adhere with the [Contributor Covenant Code of Conduct](https://github.com/yarafie/awesome-ha-blueprints/blob/main/CODE_OF_CONDUCT.md). Make sure to read and agree with those terms before submitting your contribution.

Also, keep in mind that any of the following operations require that you've successfully created a [GitHub](https://github.com/) account. If you have any troubles working with GitHub please consider taking a look at the [Official GitHub Docs](https://docs.github.com/).

## How to Contribute

### 1. I have an issue with a blueprint

Please open an issue in the [Issues tab](https://github.com/yarafie/awesome-ha-blueprints/issues) using the **Blueprint Bug Report** template and fill in all the requested fields in the template before submitting the issue.

### 2. I Want to Add a Blueprint to the Project

The way contributions are submitted is being rebuilt around simple forms. Until that is ready, please **open an issue first** in the [Issues tab](https://github.com/yarafie/awesome-ha-blueprints/issues), using the **New Controller Support** template for a new controller, or the **New blueprint proposal** template for anything else. A new blueprint needs a few files that describe it, and a maintainer will help you set them up.

If you want to prepare the files yourself, this is where a blueprint lives:

```
website/docs/blueprints/<category>/<blueprint_id>/
├── manifest.yaml
├── <blueprint_id>.png
└── <library_id>/<release_id>/
    ├── changelog.json
    ├── hooks.json            (controllers only; hooks have actions.json instead)
    └── <YYYY.MM.DD>/
        └── <blueprint_id>.yaml
```

- `<category>` is `controllers`, `hooks` or `automations`.
- `<library_id>` is usually your GitHub username, and `<release_id>` is a short name for your line of versions.
- `<YYYY.MM.DD>` is the version, written as its date.

The easiest start is to copy an existing blueprint of the same category and adapt it. Make sure the blueprint follows the [Blueprint Guidelines](#blueprint-guidelines), then submit it with the steps of the next section.

### 3. I Want to Improve an Existing Blueprint

Blueprints are versioned. An improvement is normally added as a **new version** next to the existing ones, so people who use the current version are not affected.

1. **Fork** this repository to your GitHub account.
2. **Clone** the forked repository to your local machine:
   ```sh
   git clone https://github.com/your-username/awesome-ha-blueprints.git
   cd awesome-ha-blueprints
   ```
3. **Set up your development environment** following the [Development Setup](#development-setup) section.
4. **Create a new branch.** The automatic checks read the branch name, so it must have this format:
   ```
   ahb_contrib/<category>/<blueprint_id>/<library_id>/<release_id>/<YYYY.MM.DD>/author-<your-github-username>
   ```
   The date is the version you are adding, normally today's date. For example:
   ```sh
   git checkout -b ahb_contrib/controllers/ikea_e2001_e2002/EPMatt/awesome/2026.11.17/author-your-username
   ```
5. **Add your version.** Copy the newest version folder of the release to a new folder named after your date, and make your changes in the copied `.yaml` file, following the [Blueprint Guidelines](#blueprint-guidelines). The old date also appears inside the file (the version shown in the description, the documentation link and `source_url`): change those to your date.
6. **Describe your change** by adding an entry for your version at the end of `changelog.json`, in the release folder:
   ```json
   {
     "date": "2026.11.17",
     "changes": [
       {
         "author": "@your-username",
         "description": "[Bug Fix] What changed and why.",
         "breaking": false
       }
     ]
   }
   ```
   Set `breaking` to `true` when people must change their automations after updating, and explain what they need to do.
7. **Format your files:**
   ```sh
   pnpm format
   ```
8. **Commit your changes** with a clear message:
   ```sh
   git add .
   git commit -m "Improve blueprint: [blueprint name]"
   ```
9. **Push your branch** to your forked repository and **open a Pull Request** against the `main` branch of this repository. Keep each Pull Request to a single blueprint.
10. **🎉 You're all set!** The checks run automatically, and a comment on your Pull Request tells you the result and how to fix anything that failed. A maintainer will then review your Pull Request and merge it once approved.
11. Once merged, you can **safely delete your fork** if you no longer need it.

Thank you for contributing to the Home Assistant community! 🚀🔥

### 4. I've a question regarding a blueprint / this project

Please open a discussion in the [Discussions tab](https://github.com/yarafie/awesome-ha-blueprints/discussions). Add your question in the **Q/A** category. The community will be glad to help you!

### 5. I've an idea for a new blueprint but I need help to develop it

Please open an issue in the [Issues tab](https://github.com/yarafie/awesome-ha-blueprints/issues) using the **New blueprint proposal** template and fill in all the requested fields in the template before submitting the issue.

## Blueprint Guidelines

To ensure the delivery of good quality, highly reusable blueprints which can be widely adopted across the community, blueprints must adhere to the following guidelines:

- **Clarity and Descriptiveness**: don't use ambiguous names and identifiers. Include clear descriptions for both the blueprint and its inputs.
- **Flexibility**: your blueprint must be as general as possible, and should adapt to different use-cases. Consider different conditions and effectively handle corner cases.
- **Effective Testing**: make sure to conduct proper testing before submitting your contribution.
- **Input Restriction**: use selectors to restrict what users can provide as input to the blueprint.
- **Code Documentation**: if the blueprint contains a complicated piece of code, consider adding some YAML comments to better explain what the section is trying to achieve.
- **Consistency**: be consistent within your blueprint, for what regards naming and patterns you use to accomplish certain tasks. Also, adhere to the format of the provided templates.

## Development Setup

This repository uses **DevContainers** to provide a fully automated development environment. When you open the project in a supported environment (such as VS Code with the Dev Containers extension or GitHub Codespaces), the container automatically installs all dependencies and configures the development tools.

### Requirements for DevContainers

To use DevContainers, ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [VS Code](https://code.visualstudio.com/) with the **Dev Containers** extension  
  _(Alternatively, you can use GitHub Codespaces, which supports DevContainers natively.)_

### Automated Code Formatting

- **Husky** and **Lint-Staged** ensure code is formatted correctly before each commit.
- Any staged files are automatically linted and formatted, preventing inconsistent styles from being committed.

To start developing, simply open the repository in a compatible DevContainer environment, and everything will be set up automatically! 🚀
