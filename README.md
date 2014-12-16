## scrapper.js
This scrapper was initially created to extract data from http://developer.sportsdatallc.com/ but is not used anymore.

## appv1.js
This version is old and should not be used anymore. See below.

## appv2.js
*Extracted files are inside /extractedv2.*
appv2.js is used to inject data from .csv into database.

### How to run
- Install Node.js if needed
- Run `npm install` to install all dependencies
- Be sure to have mysql running.
- Check the head of the appv2.js file and replace the `var connection` part with your own mysql values.
- Just run `node appv2.js`.
- Insert your score in the file ;)

## PHP script
This script is used as scrapper in order to extract missing values needed by appv2.js

### How to run
- Install php if needed.
- Use links.tkt to store the desired links to be read by the scrapper.
- Take yourself to the correct location and just run `php index.php`.
