# GoogleBirthdaysProvider

A [MagicMirror²](https://magicmirror.builders/) helper to include the birthdays of your Google Contacts in the default calendar.

[![GitHub tag](https://img.shields.io/github/tag/PalatinCoder/MMM-GoogleBirthdaysProvider.svg?style=flat-square)](https://github.com/PalatinCoder/MMM-GoogleBirthdaysProvider/releases)
[![Travis](https://img.shields.io/travis/com/PalatinCoder/MMM-GoogleBirthdaysProvider.svg?style=flat-square)](https://travis-ci.com/PalatinCoder/MMM-GoogleBirthdaysProvider)
[![License](https://img.shields.io/github/license/PalatinCoder/MMM-GoogleBirthdaysProvider.svg?style=flat-square)](https://github.com/PalatinCoder/MMM-GoogleBirthdaysProvider/blob/master/LICENSE.md)

> ## 🛠 Work in progress
> The module is kind of a MVP (minimum viable product) at the moment. That means you can use it in your setup, but thins will definitely change on the way to v1.0.
> Also, be aware that there are some [known issues](#known-limitations--issues)! Use it with care 😉

## How it works

The module reads the birthdays of your Google Contacts via Google's People API and exposes them as an iCal Feed through an internal URL, so you can include it in the default calendar.

![Screenshot](screenshot.png)

## Prerequisites

You need to have a project setup on Google Cloud Platform for your mirror. If you use other Google Services (like the Directions API with MMM-MyCommute), you most likely already have a project.

To enable the People API:
1. Visit the [API Library](https://console.cloud.google.com/apis/library/people.googleapis.com) and click "Enable". Make sure you have the right project selected in the top menu.

After the API is enabled, you need to create credentials for the module.

2. From the [Overview](https://console.cloud.google.com/apis/api/people.googleapis.com/overview) of the People API, select "Credentials" on the left.
3. Click the button "Create credentials" and choose "OAuth client ID"
4. Select "Other" and give the client a recognizable name, like "MMM-GoogleBirthdaysProvider"
5. Click "Create"

You should be redirected to the credentials overview

6. Download the newly created credentials and set the file aside for now, you'll need it in a moment.

## Installation

1. In your `modules/` directory, `git clone https://github.com/PalatinCoder/MMM-GoogleBirthdaysProvider.git`
2. `cd` in the new `MMM-GoogleBirthdaysProvider` directory
3. `npm install --production` (note the production flag, so you don't get all the dev dependencies - you don't need them if you just want to use the module)
4. Place the JSON file with the credentials (from step 6 above) in `google-api-credentials/credentials.json`
5. Run `npm run token:generate` and follow the instructions. This will authorize your instance of the module against your GCP project and store an authorization token.
6. Add the module to your `config.js`:
   ```
   {
       module: "MMM-GoogleBirthdaysProvider",
       config: {}
   },
   ```
   Note: Don't give the module a position, as it doesn't render any DOM at all

7. Add `http://localhost:8080/mmm-googlebirthdaysprovider` to your calendar URLs, something like this:
   ```
   (...)
		{
			module: "calendar",
			position: "top_left",
			config: {
				calendars: [
					{
						url: 'http://localhost:8080/mmm-googlebirthdaysprovider',
						symbol: 'birthday-cake',
						color: '#f00'
					}
				]
			}
		}
   (...)
   ```
8. *(optional)* If you want to see which birthday it is, set the following: 
   <details><summary>Config Options</summary>
   <p>
   Set `displayRepeatingCountTitle` to `true` and set the suffix for the count in the `repeatingCountTitle` in the calendar's options, like so:

   ```
   (...)
		{
			module: "calendar",
			position: "top_left",
			config: {
				displayRepeatingCountTitle: true,
				calendars: [
					{
						url: 'http://localhost:8080/mmm-googlebirthdaysprovider',
						symbol: 'birthday-cake',
						repeatingCountTitle: "Birthday"
						color: '#f00'
					}
				]
			}
		}
   (...)
   ```
   </p>
9. That's it, now have fun 😉

## Known Limitations / Issues
* Birthdays are only fetched once, when the node_helper is initialized. Should do that regularly
* Birthdays which *don't have a year set* are automatically set to the current year (at the time of fetching the data). That means you won't see birthdays in January during December
* By now, all birthday events are set to the current year, thus you won't see next year's birthdays untils new years day
* Only one google account is supported
* there is no pagination implemented for the data returned by Google People API. Thus, the maximum number of contacts available is 2000 (hard limit on google's side).
* The event title is hardcoded to german for now (sorry 🙈) However you could work around that by using the calendar's `titleReplace` config option
