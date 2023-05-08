# google-calendar-entries

View and manage google calendar entries

----

## Installation

1. Install dependencies
`npm install`
1. Build
`npm run build`
1. Test everything
`npm test`

## Adding profiles

This application may work with multiple profiles (download videos liked from multiple youtube accounts).

1. Come up with any profile name you want
1. Execute `npm run create <profile>`
You can create as many profiles as you want.

## Authentication

`npm run login` to login into all existing profiles
`npm run login <profile>` to login into selected profile

## Downloading

`npm start` to output all calendar entires into stdout
`npm start <profile>` to output all calendar entries from selected profile into stdout
`npm start <profile> <calendar name>` to output all calendar entries from selected profile and selected calendar into stdout

## Examples

See `./example.ps1`
