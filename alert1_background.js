alert1 = {
  make_chrome_notification: function (stack_trace) {
    var nopts = {
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Function hooked',
      message: 'Click for stack trace...'
    };
    chrome.notifications.create(stack_trace, nopts, function(){});
  },

  display_stack_trace: function (nid) {
    chrome.windows.create({'url': chrome.extension.getURL('stack_trace.html')+'#'+encodeURIComponent(nid)});
  },

  recv_msg: function (msg) {
    this.make_chrome_notification(msg.stack_trace);
  }
};

//setup notification handling
chrome.notifications.onClicked.addListener(alert1.display_stack_trace);

//listen to messages from injected code
chrome.runtime.onMessage.addListener(alert1.recv_msg.bind(alert1));
