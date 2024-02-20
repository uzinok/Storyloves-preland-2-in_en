function configureSystemId(components) {
  var values = components.map(function (component) {
    return component.value;
  });
  window.fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
}
var script = document.createElement('script');
script.src =
  'https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/2.1.0/fingerprint2.min.js';
script.onload = function () {
  if (window.requestIdleCallback) {
    requestIdleCallback(function () {
      Fingerprint2.get(function (components) {
        configureSystemId(components);
      });
    });
  } else {
    setTimeout(function () {
      Fingerprint2.get(function (components) {
        configureSystemId(components);
      });
    }, 1);
  }
};
document.head.appendChild(script);

var slv = function (settings) {
  var citiesXHR;
  var cityQueryField = $('[name=city]');
  var API = 'https://api.storyloves.net';
  // var API = "http://127.0.0.1:8083";
  var hints = {
    types: {
      empty: '',
      email: '',
      emailExists: '',
      password: '',
      noresult: '',
    },
    show: function (el, text) {
      $(el)
        .addClass('error-field')
        .find(settings.errorContainerSelector)
        .text(text)
        .addClass('error');
      $('html, body').animate({ scrollTop: $(el).offset().top }, 500);
    },
    loadHints: function () {
      var types = this.types,
        text = '',
        items = settings.hintsFrom;

      for (var key in types) {
        text = items.filter('[data-' + key + ']').text();
        if (text !== '') types[key] = text;
      }
    },
  };

  var validation = {
    options: {
      fieldsWrapper: settings.fieldsWrapper,
    },
    state: {
      step: 0,
      activkey: '',
      ccode: settings.data.ccode,
    },
    valid: function (el) {
      this.state.step++;

      if (this.state.step < this.options.fieldsWrapper.length) {
        $(el).removeClass('error-field').addClass('valid-field');

        settings.afterValidation(this.state.step);
      } else this.finaly();
    },
    check: function () {
      var el = this.options.fieldsWrapper.eq(this.state.step);
      var input = el.find('input, select'),
        fieldName = input.attr('name'),
        val = input.val(),
        emailRegExp =
          /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/i;

      if (!input.length) {
        this.valid(el);
      }

      this.state[fieldName] = val;

      switch (fieldName) {
        case 'password':
          if (!val.length || !val) {
            hints.show(el, hints.types.empty);
            return false;
          } else if (val.length < 6) {
            hints.show(el, hints.types.password);
            return false;
          } else {
            this.valid(el);
          }
          break;
        case 'city':
          if (!val.length || !val) {
            hints.show(el, hints.types.empty);
            return false;
          } else {
            this.valid(el);
          }
          break;
        case 'email':
          if (!val.length || !val) {
            hints.show(el, hints.types.empty);
            return false;
          } else if (!emailRegExp.test(val)) {
            hints.show(el, hints.types.email);
            return false;
          } else {
            this.checkEmail(val, el);
          }
          break;
        default:
          if (!val || !val.length) {
            hints.show(el, hints.types.empty);
            return false;
          } else {
            this.valid(el);
          }
          break;
      }
    },
    checkEmail: function (val, el) {
      $.ajax({
        method: 'GET',
        url: API + '/registration/check/login/' + val,
        success: function (resp) {
          if (!resp.error) {
            validation.valid(el);
          } else hints.show(el, hints.types.emailExists);
        },
        error: function (resp) {
          if (resp.error) hints.show(el, hints.types.emailExists);
          return false;
        },
      });
    },
    getCcode() {
      let offer_ccode = document.querySelector('[name=ccode]');
      return offer_ccode ? offer_ccode.value : this.state.ccode;
    },
    finaly: function () {
      var state = {
        city: this.state.city,
        name: this.state.name,
        age: this.state.age,
        email: this.state.email,
        password: this.state.password,
        fingerprint_: window.fingerprint,
      };
      settings.data.ccode = this.getCcode();

      var objs = [state, settings.data],
        data = objs.reduce(function (r, o) {
          Object.keys(o).forEach(function (k) {
            r[k] = o[k];
          });
          return r;
        }, {});
      var that = this;
      $.ajax({
        method: 'POST',
        url: API + '/land-reg',
        data: data,
        success: function (resp) {
          if (resp.success) state.key = resp.key;
          settings.whenDone({
            data: data,
            login: resp.login,
            key: state.key,
          });
        },
        error: function (resp) {
          return false;
        },
      });
    },
    goToStep: function (targetStep) {
      if (targetStep > this.state.step) return;
      this.state.step = targetStep;
      this.options.fieldsWrapper.eq(targetStep).removeClass('valid-field');
      settings.onGoTo(targetStep);
    },
  };

  var init = function () {
    hints.loadHints.call(hints);
  };

  var check = function () {
    validation.check.call(validation);
  };

  return {
    init: init,
    check: check,
    goTo: function (step) {
      validation.goToStep(step);
    },
  };
};
