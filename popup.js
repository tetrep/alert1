alert1.init = function () {

  this.html_settings = [];

  this.make_html = function () {
    this.html_settings.push(this.make_checkbox('Enable hooking: ', 'hooking_enabled'));
    this.html_settings.push(this.make_checkbox('Enable sound: ', 'sound_enabled'));
  };

  this.make_checkbox = function (name, id) {
    var div = document.createElement('div');
    div.setAttribute('display', 'inline-block');
    div.setAttribute('align', 'right');

    var label = document.createElement('label');

    var checkbox_text = document.createElement('span');
    checkbox_text.innerText = name;

    var checkbox = document.createElement('input');
    checkbox.setAttribute('id', id);
    checkbox.setAttribute('type', 'checkbox');
    if (this.settings[id]) {
      checkbox.setAttribute('checked', this.settings[id]);
    }
    checkbox.addEventListener('click', this.update_settings.bind(this), false);

    label.appendChild(checkbox_text);
    label.appendChild(checkbox);
    div.appendChild(label);

    document.body.appendChild(div);

    return checkbox;
  };

  this.update_settings = function () {
    var i = 0;
    for (i = 0; i < this.html_settings.length; i++) {
      this.settings[this.html_settings[i].getAttribute('id')] = this.html_settings[i].checked;
    }
    this.save_settings(undefined, 'settings');
  };

  /* looks like it's slow because it's not caching, but we might need this later if settings get big
  this.add_loading_div = function () {
    var loading_div_background = document.body.appendChild(document.createElement('div'));
    var loading_div_foreground = loading_div_background.appendChild(document.createElement('div'));

    //background styling
    loading_div_background.setAttribute('id', 'loading-div-background');
    loading_div_background.style.position = 'absolute';
    loading_div_background.style.top = '0';
    loading_div_background.style.left = '0';
    loading_div_background.style.width = '100%';
    loading_div_background.style.height = '100%';
    loading_div_background.style.backgroundColor = 'black';
    loading_div_background.style.background = 'rgba(0,0,0,0.8)'
    loading_div_background.style.zIndex = '1023';
    //flex
    loading_div_background.style.display = 'flex';
    loading_div_background.style.flexDirecttion = 'row';
    loading_div_background.style.flexWrap = 'nowrap';
    loading_div_background.style.justifyContent = 'center';
    loading_div_background.style.alignContent = 'center';
    loading_div_background.style.alignItems = 'center';

    //foreground styling
    loading_div_foreground.setAttribute('id', 'loading-div-foreground');
    loading_div_foreground.setAttribute('in_progress', 0);
    loading_div_foreground.style.backgroundColor = 'white';
    loading_div_foreground.style.zIndex = '1024';
  };

  this.remove_loading_div = function () {
    var loading_div = document.getElementById('loading-div-background');
    loading_div.parentNode.removeChild(loading_div);
  };
  //*/

  //chrome.storage.local.clear(function () {});
  this.load_settings(this.make_html.bind(this));
};

(alert1.init.bind(alert1))();
