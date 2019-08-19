# 📸 screenshot-glb

Easily take screenshots and create thumbnail images for glTF 2.0 Binary (GLB) files.

## Install

Use npm to install this tool:

`npm install ---save @shopify/screenshot-glb`

## Usage

To start taking screenshots of GLB files

```sh
$ screenshot-glb
Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  -i, --input   Input glTF 2.0 binary (GLB) filepath                  [required]
  -o, --output  Output PNG screenshot filepath                        [required]
  -w, --width   Output image width
  -h, --height  Output image height
```

## Dependencies

The module relies on using [puppeteer](https://www.npmjs.com/package/puppeteer) to spawn a headless instance of Chrome to render Google's [<model-viewer>](https://github.com/GoogleWebComponents/model-viewer) web component with the GLB model loaded. 
  
### Linux

You may need to install the following packages in order for the headless Chrome instance to work on headless Linux VM machines:

```
gconf-service 
libasound2 
libatk1.0-0 
libatk-bridge2.0-0 
libc6 
libcairo2 
libcups2 
libdbus-1-3 
libexpat1 
libfontconfig1 
libgcc1 
libgconf-2-4 
libgdk-pixbuf2.0-0
libglib2.0-0 
libgtk-3-0
libnspr4
libpango-1.0-0
libpangocairo-1.0-0
libstdc++6 
libx11-6 
libx11-xcb1 
libxcb1 
libxcomposite1 
libxcursor1 
libxdamage1 
libxext6 
libxfixes3 
libxi6 
libxrandr2 
libxrender1
libxss1 
libxtst6 
ca-certificates 
fonts-liberation 
libappindicator1 
libnss3 
lsb-release 
xdg-utils
wget
```
