const electron = require('electron');
const url = require('url');
const path = require('path');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/views/mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // quit appwindow when closed mainwindow
    mainWindow.on('closed', function(){
        app.quit();
    });

    // build menu for template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add Window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/views/addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // gc handler
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function (e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
    // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
    //addWindow = null;
});

const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}