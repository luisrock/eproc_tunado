let iconToBe;
let titleToBe;
let enabled;
let password;
let focus;
let actions;
let text;
let edit;

//defining icon on tab creation
chrome.tabs.onCreated.addListener(function() {
    chrome.storage.sync.get('enabled', data => {
        if(data.hasOwnProperty('enabled') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({enabled:true});
            enabled = true;
        } else {
            enabled = data.enabled;
        }
        iconToBe = (enabled) ? "icon16.png" : "icon16off.png";
        console.log('on creation => ' + enabled + ' : ' + iconToBe);
        chrome.browserAction.setIcon({
            path: `icons/${iconToBe}`
        });
        titleToBe = (enabled) ? "está tunado!" : "não está tunado.";
        chrome.browserAction.setTitle({
            title: `Eproc ${titleToBe}`
        });
    });

    chrome.storage.sync.get('focus', data => {
        if(data.hasOwnProperty('focus') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({focus:true});
            focus = true;
        } else {
            focus = data.focus;
        }
    });

    chrome.storage.sync.get('password', data => {
        if(data.hasOwnProperty('password') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({password:true});
            password = true;
        } else {
            password = data.password;
        }
    });

    chrome.storage.sync.get('actions', data => {
        if(data.hasOwnProperty('actions') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({actions:true});
            actions = true;
        } else {
            actions = data.actions;
        }
    });

    chrome.storage.sync.get('text', data => {
        if(data.hasOwnProperty('text') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({text:true});
            text = true;
        } else {
            text = data.text;
        }
    });

    chrome.storage.sync.get('edit', data => {
        if(data.hasOwnProperty('edit') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({edit:true});
            edit = true;
        } else {
            edit = data.edit;
        }
    });
});

//defining icon on tab update
chrome.tabs.onUpdated.addListener(function() {
    chrome.storage.sync.get('enabled', data => {
        if(data.hasOwnProperty('enabled') === false) { 
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({enabled:true});
            enabled = true;
        } else {
            enabled = data.enabled;
        }
        iconToBe = (enabled) ? "icon16.png" : "icon16off.png";
        console.log('on update => ' + enabled + ' : ' + iconToBe);
        chrome.browserAction.setIcon({
            path: `icons/${iconToBe}`
        });
        titleToBe = (enabled) ? "está tunado!" : "não está tunado.";
        chrome.browserAction.setTitle({
            title: `Eproc ${titleToBe}`
        });
    });
});




//get enabled variable
// chrome.storage.sync.get('enabled', data => {
//     if(data.hasOwnProperty('enabled') === false) { 
//         console.log('toggle => ' + data);
//         //it does not exist yet. Let's set it true...
//         chrome.storage.sync.set({enabled:true});
//         enabled = true;
//     } else {
//         console.log('toggle => ' + data.enabled);
//         enabled = data.enabled;
//     }
    
//     // //defining first icon
//     // iconToBe = (enabled) ? "icon16.png" : "icon16off.png";
//     // console.log('(background) initial => ' + enabled + ' : ' + iconToBe);
//     // chrome.browserAction.setIcon({
//     //     path: `icons/${iconToBe}`
//     // });
// });


