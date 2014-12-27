alert1 = {
  make_chrome_notification: function (data) {
    var nopts = {
      type: 'basic',
      iconUrl: 'icon.png',
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

  recv_msg: function (data) {
    this.make_chrome_notification(data);
  }
};

//setup notification handling
chrome.notifications.onClicked.addListener(alert1.display_stack_trace);

//listen to messages from injected code
chrome.runtime.onMessage.addListener(alert1.recv_msg.bind(alert1));
