[![New Relic One Catalog Project header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/New_Relic_One_Catalog_Project.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#category-new-relic-one-catalog-project)

<p align="center">
	<img src="assets/documentation-images/docs-header.svg" />
    <br>
    A New Relic application that aligns Workload data (or other Entities) in a Geographic management console
</p>

<p align="center">
<img src="https://img.shields.io/github/v/release/newrelic/nr1-workload-geoops?include_prereleases&sort=semver" title="GitHub release (latest SemVer including pre-releases)">
<img src="https://github.com/newrelic/nr1-workload-geoops/workflows/CI/badge.svg" title="CI">
<img src="https://snyk.io/test/github/newrelic/nr1-workload-geoops" title="Snyk">
</p>

------

## Usage

Workloads GeoOps provides a geographic exploration of [Workload](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster) data (collections of Entities) tied to geographic data, including location metadata. Find additional information in the [docs](docs/documentation.md) directory.

![Screenshot #1](assets/screenshots/screenshot_01.png)
<p align="center">
<img src="assets/screenshots/screenshot_02.png" width="32.5%">
<img src="assets/screenshots/screenshot_03.png" width="32.5%">
<img src="assets/screenshots/screenshot_04.png" width="32.5%">
</p>

## Walkthrough Video

Find the walkthrough video [here](https://www.youtube.com/watch?v=fh0C553kA3c&feature=youtu.be).

## Open Source License

This project is distributed under the [Apache 2 license](LICENSE).

## What do you need to make this work?

1. [New Relic One](https://newrelic.com/platform)
2. (recommended) Configured [Workloads](https://docs.newrelic.com/docs/new-relic-one/use-new-relic-one/core-concepts/new-relic-one-workloads-isolate-resolve-incidents-faster) in New Relic One

## Getting started

First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

```bash
git --version
npm -v
```

Next, clone this repository and run the following scripts:

```bash
git clone https://github.com/newrelic/nr1-workload-geoops.git
cd nr1-workload-geoops
nr1 nerdpack:uuid -gf
npm install
npm start
```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# this is to create a new uuid for the nerdpack so that you can deploy it to your account
nr1 nerdpack:uuid -g [--profile=your_profile_name]
# to see a list of APIkeys / profiles available in your development environment, run nr1 credentials:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Community Support

New Relic hosts and moderates an online forum where you can interact with New Relic employees as well as other customers to get help and share best practices. Like all New Relic open source community projects, there's a related topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

[https://discuss.newrelic.com/t/workload-geoops-nerdpack/99478](https://discuss.newrelic.com/t/workload-geoops-nerdpack/99478)

Please do not report issues with Workload GeoOps to New Relic Global Technical Support. Instead, visit the [`Explorers Hub`](https://discuss.newrelic.com/t/workload-geoops-nerdpack/99478) for troubleshooting and best-practices.

## Issues / Enhancement Requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues before submitting a new issue.

## Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.
