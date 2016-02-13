var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Templates
var menuTemplate = require('./app_menu');

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('before-quit', function() {
  mainWindow.forceClose = true;
});

app.on('activate-with-no-open-windows', function() {
  mainWindow.show();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Set menu
  var mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900, height: 800,
    "type": "toolbar",
    "title": "Basecamp 3",
    "icon": "./assets/shared/icon.png",
    "node-integration": false
  });

  // Load basecamp.
  mainWindow.loadUrl('https://launchpad.37signals.com/', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36'
  });

  // Open links externally
  mainWindow.webContents.on("new-window", function(event, url, frameName, disposition){
    require('shell').openExternal(url)
    event.preventDefault();
  });

  // Open all non-target=_blank links externally which aren't basecamp
  mainWindow.webContents.on("will-navigate", function(event, url) {

    regex = /(37signals.com|basecamp.com)/;
    if (!url.match(regex)) {
      require('shell').openExternal(url);
      event.preventDefault();
    }
  });

  // Update OSX badge
  if(process.platform == 'darwin') {
    mainWindow.on('page-title-updated', function(event, title) {
      var unreadCount = getUnreadCount(title);
      app.dock.setBadge(unreadCount);
      if (unreadCount > 0)
        app.dock.bounce('informational');
    });
  }

  // Hide window on OSX instead of closing it
  mainWindow.on('close', function(e){
    if (mainWindow.forceClose) return;
    if (process.platform == 'darwin') {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.show();
});

function getUnreadCount(title) {
  var regex = /^\((\d+)\)/;
  var match = regex.exec(title);

  var badgeCount = ""
  if(match != undefined) {
    badgeCount = match[1];
  }

  return badgeCount;
}
