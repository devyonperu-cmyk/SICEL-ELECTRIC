(function () {
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  function selectText(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* sin selección disponible */ }
  }

  document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy-target'));
      var text = btn.getAttribute('data-copy') || (target ? target.textContent : '');
      var label = btn.querySelector('span');
      var original = label ? label.textContent : '';
      function show(msg) {
        if (!label) return;
        label.textContent = msg;
        setTimeout(function () { label.textContent = original; }, 2400);
      }
      function fallback() {
        if (target) selectText(target);
        show('Texto seleccionado: cópialo');
      }
      try {
        navigator.clipboard.writeText(text).then(function () { show('Copiado'); }, fallback);
      } catch (e) {
        fallback();
      }
    });
  });
})();

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var WA = '51998234250';
  var result = document.getElementById('contact-result');
  var preview = document.getElementById('contact-preview');
  var link = document.getElementById('contact-wa');
  var error = document.getElementById('contact-error');

  function val(id) { return document.getElementById(id).value.trim(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      error.textContent = 'Faltan datos obligatorios o la autorización de la Política de privacidad. Revisa los campos marcados.';
      error.hidden = false;
      result.hidden = true;
      form.reportValidity();
      return;
    }
    error.hidden = true;
    var lines = [
      'Hola SICEL ELECTRIC, soy ' + val('c-nombre') + '.',
      'Necesito: ' + val('c-servicio') + '.',
      'Distrito: ' + val('c-distrito') + '.'
    ];
    var detalle = val('c-mensaje');
    if (detalle) lines.push('Detalle: ' + detalle);
    lines.push('Mi celular: ' + val('c-telefono') + '.');
    var text = lines.join('\n');
    preview.textContent = text;
    link.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    result.hidden = false;
    link.focus();
  });
})();

(function () {
  var form = document.getElementById('libro-form');
  if (!form) return;
  var DEPLOY = true;
  var review = document.getElementById('lr-review');
  var textEl = document.getElementById('lr-text');
  var codeView = document.getElementById('lr-code-view');
  var errorEl = document.getElementById('lr-error');
  var note = document.getElementById('lr-preview-note');
  var menor = document.getElementById('lr-menor');
  var apod = document.getElementById('lr-apoderado');
  var apodInputs = apod.querySelectorAll('input');
  var current = null;

  function pad(n) { return String(n).padStart(2, '0'); }
  function makeCode(d) {
    return 'LR-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }
  function fmt(d, withTime) {
    try {
      return withTime
        ? d.toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })
        : d.toLocaleDateString('es-PE', { dateStyle: 'long' });
    } catch (e) {
      return d.toISOString();
    }
  }
  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function r(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  document.getElementById('lr-fecha').textContent = fmt(new Date(), false);

  function syncMenor() {
    apod.hidden = !menor.checked;
    apodInputs.forEach(function (i) { i.required = menor.checked; });
  }
  menor.addEventListener('change', syncMenor);
  syncMenor();

  function build(code, when) {
    var dd = document.querySelectorAll('.provider-box dd');
    var L = [];
    L.push('LIBRO DE RECLAMACIONES · HOJA DE RECLAMACIÓN');
    L.push('N.° ' + code + ' · Fecha: ' + when);
    L.push('');
    L.push('PROVEEDOR');
    L.push('Razón social: ' + dd[0].textContent.trim() + ' · RUC: ' + dd[1].textContent.trim());
    L.push('Nombre comercial: SICEL ELECTRIC · Domicilio: ' + dd[3].textContent.trim());
    L.push('');
    L.push('1. CONSUMIDOR');
    L.push('Nombre: ' + v('lr-nombre'));
    L.push(v('lr-tipodoc') + ': ' + v('lr-numdoc'));
    L.push('Domicilio: ' + v('lr-domicilio'));
    L.push('Teléfono: ' + v('lr-telefono') + ' · Correo: ' + v('lr-email'));
    if (menor.checked) {
      L.push('Menor de edad. Padre, madre o apoderado: ' + v('lr-ap-nombre') + ' (' + v('lr-ap-doc') + ')');
    }
    L.push('');
    L.push('2. BIEN CONTRATADO');
    var monto = v('lr-monto');
    L.push('Tipo: ' + r('Tipo de bien') + (monto ? ' · Monto reclamado: S/ ' + Number(monto).toFixed(2) : ''));
    if (v('lr-ref')) L.push('Comprobante o cotización: ' + v('lr-ref'));
    L.push('Descripción: ' + v('lr-desc'));
    L.push('');
    L.push('3. DETALLE Y PEDIDO');
    L.push('Tipo: ' + r('Tipo'));
    L.push('Detalle: ' + v('lr-detalle'));
    L.push('Pedido: ' + v('lr-pedido'));
    L.push('Respuesta por: ' + r('Respuesta por'));
    L.push('');
    L.push('4. OBSERVACIONES Y ACCIONES DEL PROVEEDOR: pendiente de respuesta.');
    L.push('');
    L.push('El proveedor responderá en un plazo máximo de 15 días hábiles improrrogables.');
    L.push('La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.');
    return L.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      errorEl.textContent = 'Faltan datos obligatorios. Revisa los campos marcados.';
      errorEl.hidden = false;
      form.reportValidity();
      return;
    }
    errorEl.hidden = true;
    var d = new Date();
    var code = makeCode(d);
    var when = fmt(d, true);
    current = { code: code, when: when, text: build(code, when) };
    codeView.textContent = 'N.° ' + code;
    textEl.textContent = current.text;
    note.hidden = true;
    form.hidden = true;
    review.hidden = false;
    review.focus();
    review.scrollIntoView({ block: 'start' });
  });

  document.getElementById('lr-edit').addEventListener('click', function () {
    review.hidden = true;
    form.hidden = false;
    document.getElementById('lr-nombre').focus();
  });

  document.getElementById('lr-confirm').addEventListener('click', function () {
    if (!current) return;
    if (!DEPLOY) {
      note.textContent = 'Vista previa: en la web publicada, este botón envía la hoja al correo de SICEL ELECTRIC y una copia al correo del consumidor.';
      note.hidden = false;
      return;
    }
    document.getElementById('lr-codigo').value = current.code;
    document.getElementById('lr-fecha-in').value = current.when;
    document.getElementById('lr-subject').value = 'Libro de Reclamaciones · ' + r('Tipo') + ' · ' + current.code;
    document.getElementById('lr-autoresponse').value =
      'Recibimos tu hoja de reclamación. Esta es tu copia:\n\n' + current.text + '\n\nSICEL ELECTRIC';
    document.getElementById('lr-next').value =
      location.origin + location.pathname + '?enviado=' + encodeURIComponent(current.code);
    this.disabled = true;
    this.textContent = 'Enviando…';
    HTMLFormElement.prototype.submit.call(form);
  });

  var printBtn = document.getElementById('lr-print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  if (DEPLOY) {
    var sent = new URLSearchParams(location.search).get('enviado');
    if (sent) {
      document.getElementById('lr-sent-code').textContent = 'N.° ' + sent;
      document.getElementById('lr-sent').hidden = false;
      form.hidden = true;
    }
  }
})();
