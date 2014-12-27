alert1 = {
  settings: {
    enabled: true,
  },

  make_chrome_notification: function (data) {
    var nopts = {
      type: 'basic',
      iconUrl: 'img/icon/icon128.png',
      title: data.title + ' ' + data.func,
      message: 'Click for stack trace...'
    };
    var ding = new Audio("lvlup.wav");
    ding.play();
    chrome.notifications.create(data.stack_trace, nopts, function(){});
  },

  display_stack_trace: function (nid) {
    chrome.windows.create({'url': chrome.extension.getURL('stack_trace.html')+'#'+encodeURIComponent(nid)});
  },

  recv_msg: function (data, sender, send_response) {
    //check if coming from a tab
    if (sender.url || sender.tab) {
      //display stack trace sent to us
      if (data.stack_trace) {
        this.make_chrome_notification(data);
      }
      //return settings if tab isn't sending us stack trace
      else {
        send_response(this.settings);
      }
    }
    //set settings if not from a tab and if given settings to set
    else if (data.settings) {
      alert1.settings = data.settings;
    }

    console.log(alert1.settings);
  }
};

//setup notification handling
chrome.notifications.onClicked.addListener(alert1.display_stack_trace);

//listen to messages from injected code
chrome.runtime.onMessage.addListener(alert1.recv_msg.bind(alert1));
