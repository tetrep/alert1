alert1.init = function () {
  this.make_chrome_notification = function (data) {
    var nopts = {
      type: 'basic',
      iconUrl: 'img/icon/icon128.png',
      title: data.page_title+' --> '+data.func+'('+data.org_msg+')',
      message: 'Click for details...'
    };

    if(this.settings.sound_enabled) {
      var sound = {};

      if (this.settings.tutturuu) {
        var sound = new Audio('audio/tutturuu.wav');
      } else {
        var sound = new Audio('audio/lvlup.wav');
      }

      sound.play();
    }

    chrome.notifications.create(data.page_title+'\n'+data.func+'('+data.org_msg+')\n'+data.location.href+'\n'+data.stack_trace, nopts, function(){});
  };

  this.display_stack_trace = function (nid) {
    chrome.windows.create({'url': chrome.extension.getURL('stack_trace.html')+'#'+encodeURIComponent(nid)});
  };

  this.recv_msg = function (data, sender) {
    this.load_settings( (function () {
      if (!(this.settings.hooking_enabled)) { return; }
      //check if coming from a tab
      if (sender.url || sender.tab) {
        //display stack trace sent to us
        if (data.func && data.stack_trace) {
          this.make_chrome_notification(data);
        } else {
          console.log('invalid message format');
        }
      } else {
        console.log('invalid message sender');
      }
    }).bind(this));
  };

  //setup notification handling
  chrome.notifications.onClicked.addListener(this.display_stack_trace);

  //listen to messages from injected code
  chrome.runtime.onMessage.addListener(this.recv_msg.bind(this));
};

(alert1.init.bind(alert1))();
