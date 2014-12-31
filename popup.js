alert1.init = function () {

  this.html_settings = [];

  this.make_html = function () {
    this.html_settings.push(this.make_checkbox('Enable hooking: ', 'hooking_enabled'));
    this.html_settings.push(this.make_checkbox('Enable sound: ', 'sound_enabled'));
  };

  this.make_checkbox = function (name, id) {
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

    var div = document.createElement('div');
    div.setAttribute('display', 'inline-block');
    div.setAttribute('align', 'right');

    label.appendChild(checkbox_text);
    label.appendChild(checkbox);
    div.appendChild(label);

    document.body.appendChild(div);

    return checkbox;
  };

  this.update_settings = function () {
    this.html_settings.map(function (elem) {
        this.settings[elem.getAttribute('id')] = elem.checked;
      }, this);

    this.save_settings(undefined, 'settings');
  };

  //chrome.storage.local.clear(function () {});
  this.load_settings(this.make_html.bind(this));
};

alert1.init();
