alert1.make_chrome_notification = function (page_title, func, stack_trace, org_msg) {
  var nopts = {
    type: 'basic',
    iconUrl: 'img/icon/icon128.png',
    title: page_title+' --> '+func+'('+org_msg+')',
    message: 'Click for stack trace...'
  };

  if(this.settings.sound_enabled) {
    var ding = new Audio("lvlup.wav");
    ding.play();
  }

  chrome.notifications.create(stack_trace, nopts, function(){});
};

alert1.display_stack_trace = function (nid) {
  chrome.windows.create({'url': chrome.extension.getURL('stack_trace.html')+'#'+encodeURIComponent(nid)});
};

alert1.recv_msg = function (data, sender) {
  this.load_settings( (function () {
    //check if coming from a tab
    if (sender.url || sender.tab) {
      //display stack trace sent to us
      if (data.title && data.func && data.stack_trace && data.org_msg) {
        this.make_chrome_notification(data.title, data.func, data.stack_trace, data.org_msg);
      } else {
        console.log('invalid message format');
      }
    } else {
      console.log('invalid message sender');
    }
  }).bind(this));
};

//setup notification handling
chrome.notifications.onClicked.addListener(alert1.display_stack_trace);

//listen to messages from injected code
chrome.runtime.onMessage.addListener(alert1.recv_msg.bind(alert1));
