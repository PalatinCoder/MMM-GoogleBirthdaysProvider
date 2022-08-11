[![License](https://img.shields.io/github/license/ulrichwisser/MMM-CardDavBirthdaysProvider.svg?style=flat-square)](https://github.com/PalatinCoder/MMM-GoogleBirthdaysProvider/blob/master/LICENSE.md)

# MMM-CardDavBirthdaysProvider
Forked from [MMM-GoogleBirthdaysProvider](https://github.com/PalatinCoder/MMM-GoogleBirthdaysProvider). 

A *big* thank you to PalatinCoder for the original code.


> ## 🛠 Work in progress
> Please open an issue or cantact me with any questions or error reports.

## How it works

The module extracts birthdays from a Cardav feed and exposes them as an iCal Feed through an internal URL, so you can include it in the default calendar. The list of birthdays is updated every hour.

![Screenshot](screenshot.png)

## Prerequisites

## Installation

1. In your `modules/` directory, `git clone https://github.com/ulrichwisser/MMM-CardDavBirthdaysProvider.git`
2. `cd` in the new `MMM-CardDavBirthdaysProvider` directory
3. `npm install --production` (note the production flag, so you don't get all the dev dependencies - you don't need them if you just want to use the module)
6. Add the module to your `config.js`:
   ```
   {
       module: "MMM-CardDavBirthdaysProvider",
       config: {}
   },
   ```
   Note: Don't give the module a position, as it doesn't render any DOM at all

7. Add `http://localhost:8080/mmm-carddavbirthdaysprovider` to your calendar URLs, something like this:
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
* Birthdays which *don't have a year set* are automatically set to the current year (at the time of fetching the data). That means you won't see birthdays in January during December
* By now, all birthday events are set to the current year, thus you won't see next year's birthdays untils new years day
