function toggleOnOff(flag, element, geral = false) {
    let classToAdd = (!flag) ? 'toggle-off' : 'toggle-on';
    let classToRemove = (flag) ? 'toggle-off' : 'toggle-on';
    element.classList.add(classToAdd);
    element.classList.remove(classToRemove);
    if (!geral) {
        element.textContent = (!flag) ? 'off' : 'on';
    } else {
        element.textContent = (!flag) ? 'desativado' : 'ativado';
    }
}

document.addEventListener('DOMContentLoaded', function(event) {

    let btnGeral = document.getElementById('toggle');
    let enabled;
    let password;
    let btnPassword = document.getElementById('toggle-password');
    let focus;
    let btnFocus = document.getElementById('toggle-focus');
    let actions;
    let btnActions = document.getElementById('toggle-actions');
    let text;
    let btnText = document.getElementById('toggle-text');
    let edit;
    let btnEdit = document.getElementById('toggle-edit');
    let btnReload = document.getElementById('btn-reload');


    //get enabled variable
    chrome.storage.sync.get('enabled', data => {
        if(data.hasOwnProperty('enabled') === false) { 
            //console.log('toggle => ' + data);
            //it does not exist yet. Let's set it true...
            chrome.storage.sync.set({enabled:true});
            enabled = true;
        } else {
            //console.log('toggle => ' + data.enabled);
            enabled = data.enabled;
        }
        
        //defining first icon
        iconToBe = (enabled) ? "icon16.png" : "icon16off.png";
        //console.log('initial => ' + enabled + ' : ' + iconToBe);
        chrome.browserAction.setIcon({
            path: `icons/${iconToBe}`
        });

        //console.log(enabled); //comentar
        toggleOnOff(enabled, btnGeral, true);
    });


    chrome.storage.sync.get('password', data => {
        password = data.password;
        toggleOnOff(password, btnPassword);
    });

    chrome.storage.sync.get('focus', data => {
        focus = data.focus;
        toggleOnOff(focus, btnFocus);
    });

    chrome.storage.sync.get('actions', data => {
        actions = data.actions;
        toggleOnOff(actions, btnActions);
    });

    chrome.storage.sync.get('text', data => {
        text = data.text;
        toggleOnOff(text, btnText);
    });

    chrome.storage.sync.get('edit', data => {
        edit = data.edit;
        toggleOnOff(edit, btnEdit);
    });

    
    /*
    let tabId;
    //get tab ID (also useful for getting current tab url...)
    let query = { active: true, currentWindow: true };    
    chrome.tabs.query(query, function(tabs) {
        let currentTab = tabs[0]; // there will be only one in this array
        tabId = currentTab.id;
        // console.log(currentTab); // also has properties like currentTab.id
    });
    */

    btnGeral.onclick = () => {
        enabled = !enabled;
        //console.log(enabled); //comentar
        toggleOnOff(enabled, btnGeral, true);
        window.close();
        chrome.storage.sync.set({enabled:enabled});
        //recarregando todas as abas do eproc
        chrome.tabs.query({url: "https://eproc.jfrj.jus.br/*"}, function(results) {
            results.forEach(function (item) {
                chrome.tabs.reload(item.id);
            });
        });
        
        //

        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //     chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        // });

        // //changing icon
        // iconToBe = (enabled) ? "icon16.png" : "icon16off.png";
        // console.log('on click => ' + enabled + ' : ' + iconToBe);
        // chrome.browserAction.setIcon({
        //     path: `icons/${iconToBe}`
        // });
    };

    btnPassword.onclick = () => {
        password = !password;
        toggleOnOff(password, btnPassword);
        chrome.storage.sync.set({password:password});
    }

    btnFocus.onclick = () => {
        focus = !focus;
        toggleOnOff(focus, btnFocus);
        chrome.storage.sync.set({focus:focus});
    }

    btnActions.onclick = () => {
        actions = !actions;
        toggleOnOff(actions, btnActions);
        chrome.storage.sync.set({actions:actions});
    }

    btnText.onclick = () => {
        text = !text;
        toggleOnOff(text, btnText);
        chrome.storage.sync.set({text:text});
    }

    btnEdit.onclick = () => {
        edit = !edit;
        toggleOnOff(edit, btnEdit);
        chrome.storage.sync.set({edit:edit});
    }


    btnReload.onclick = () => {
        window.close();
        //recarregando todas as abas do eproc
        chrome.tabs.query({url: "https://eproc.jfrj.jus.br/*"}, function(results) {
            results.forEach(function (item) {
                chrome.tabs.reload(item.id);
            });
        }); 
    }

});

