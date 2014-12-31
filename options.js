alert1.init = function() {
  this.html_settings = [];
  this.content_keys = ['obj_name', 'obj_js', 'hooked_functions_json', 'hook_js', 'hook_init_js'];

  this.make_html = function () {
    //make a shitty save button
    var save_button = document.createElement('button');
    save_button.innerText = 'Save';
    save_button.addEventListener('click', this.update_settings.bind(this), false);

    //make a shitty clear button
    var clear_button = document.createElement('button');
    clear_button.innerText = 'Clear';
    clear_button.setAttribute('align', 'right');
    clear_button.addEventListener('click', (function () { this.clear_settings(document.location.reload(true), 'content'); }).bind(this), false);

    document.body.appendChild(save_button);
    document.body.appendChild(clear_button);
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(document.createElement('br'));

    //add all the settings boxes
    this.content_keys.map(this.make_js_box_wrapper, this);
  };

  this.make_js_box_wrapper = function (obj_key) {
    this.make_js_box(obj_key, obj_key);
  };

  this.make_js_box = function (name, id) {
    var text = document.createElement('textarea');
    text.setAttribute('id', id);
    text.setAttribute('rows', '15');
    text.setAttribute('cols', '120');
    if (this.content[id]) {
      text.innerHTML = this.content[id];
    } else {
      text.innerText = name;
    }

    var div = document.createElement('div');

    div.appendChild(text);
    document.body.appendChild(div);
  };

  this.update_settings = function () {
    this.content_keys.map(this.update_content, this);

    this.save_settings(undefined, 'content');
  };

  this.update_content = function (obj_key) {
    this.content[obj_key] = document.getElementById(obj_key).value;
  };

  this.load_settings(this.make_html.bind(this), 'content');
};

alert1.init();
