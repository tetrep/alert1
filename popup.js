var div = document.body.appendChild(document.createElement('div'));

var checkbox_text = div.appendChild(document.createElement('p'));
checkbox_text.innerText = 'Enabled ';

var checkbox = checkbox_text.appendChild(document.createElement('input'));
checkbox.setAttribute('id', 'settings.enabled');
checkbox.setAttribute('type', 'checkbox');
checkbox.setAttribute('checked', 'checked');
checkbox.addEventListener('click', update_settings, false);

function update_settings () {
  var alert1 = {};
  alert1.settings = {};
  alert1.settings.enabled = document.getElementById('settings.enabled').checked;
  chrome.runtime.sendMessage({settings: alert1.settings}, function(){});
}
