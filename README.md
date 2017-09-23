# Annode Arcade Front-loader
## What is Annode?
Annode is a JS-based open source arcade frontloader originally created as a school project. The goal was to build an entire arcade machine from scratch including the software (aside from emulators). Annode was created with the goal of being incredibly user-friendly and providing a simple, polished arcade experience.
## How does Annode function?
Annode utilises a framework(?) made by the people at GitHub called Electron which allows javascript to utilise the power of Chromium to run javascript-based application on the desktop. It also supports node packages & other JS frameworks like jQuery & Angular meaning the possibilites are endless.

In essence, annode simply the given file in _options.cfg_ for Emulators, roms, boxart & metadata - since this is a school project I set out to create/write & download all these assets manually. In the future, I hope to set up some form of metadata scraping, rom-searching and potentially even boxart/media scraping utility.
## Why should I use Annode?
**Honestly - you probably shouldn't.** This is because I created Annode with my set-up in mind & cut corners to save time/thinking often by doing things like putting keycodes directly in the script instead of reading a config file. Unless you're willing to do some medium-heavy editing to suit your arcade system I would strongly advise against using this and go with something like Emulationstation. However, pull requests to make Annode more open & efficient due to my lazy practices/stupidity will always be approved.

_Finish this later, - Adam 23/09/17_
