(() => {
  'use strict';

  const forms = document.querySelectorAll('form[data-bs-validate]');

  forms.forEach(form => {
    form.querySelectorAll('.form-field').forEach(field => {
      const input = field.querySelector('input[type="radio"], input[type="checkbox"]');
      if (!input) return;
      field.classList.add('form-check');
      input.classList.add('form-check-input');
      const label = field.querySelector('label');
      if (label) label.classList.add('form-check-label');
    });

    form.querySelectorAll('select').forEach(sel => {
      sel.classList.remove('form-control');
      sel.classList.add('form-select');
    });

    const textControls = () =>
      form.querySelectorAll('input.form-control, textarea.form-control');
    const selects = () => form.querySelectorAll('select.form-select');
    const radios = () => form.querySelectorAll('input[type="radio"]');
    const passwords = () => form.querySelectorAll('input[type="password"]');

    const setState = (el, valid) => {
      el.classList.toggle('is-valid', valid);
      el.classList.toggle('is-invalid', !valid);
    };

    const clearState = el => el.classList.remove('is-valid', 'is-invalid');

    const checkPasswordMatch = () => {
      const [pass, confirm] = passwords();
      if (!pass || !confirm) return;
      const msg = confirm.parentElement.querySelector('.invalid-feedback');
      if (confirm.value && pass.value !== confirm.value) {
        confirm.setCustomValidity('Passwords do not match');
        if (msg) msg.textContent = 'Passwords do not match';
      } else {
        confirm.setCustomValidity('');
        if (msg) msg.textContent = 'Confirm the password';
      }
    };

    const validateForm = (isSubmit = false) => {
      let isValid = true;
      checkPasswordMatch();

      textControls().forEach(el => {
        const ok = el.checkValidity();
        if (!ok) isValid = false;
        if (isSubmit || el.dataset.touched) setState(el, ok);
      });

      selects().forEach(el => {
        const ok = el.checkValidity();
        if (!ok) isValid = false;
        if (isSubmit || el.dataset.touched) setState(el, ok);
      });

      const groups = {};
      radios().forEach(r => (groups[r.name] ||= []).push(r));

      Object.values(groups).forEach(group => {
        const anyChecked = group.some(r => r.checked);
        if (!anyChecked) isValid = false;

        if (isSubmit || group.some(r => r.dataset.touched)) {
          group.forEach(r => {
            if (!anyChecked) {
              r.classList.remove('is-valid');
              r.classList.add('is-invalid');
            } else {
              r.classList.remove('is-invalid');
              r.classList.toggle('is-valid', r.checked);
            }
          });
        }
      });

      form.querySelectorAll('input[type="checkbox"]').forEach(clearState);

      return isValid;
    };

    form.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.type === 'checkbox') return;

      const onChange = () => {
        el.dataset.touched = 'true';
        if (el.type === 'radio') {
          form
            .querySelectorAll(`input[type="radio"][name="${el.name}"]`)
            .forEach(r => (r.dataset.touched = 'true'));
        }
        if (el.type === 'password') {
          const confirm = passwords()[1];
          if (confirm && confirm.value) confirm.dataset.touched = 'true';
        }
        validateForm(false);
      };

      el.addEventListener('input', onChange);
      el.addEventListener('change', onChange);
    });

    form.addEventListener('submit', event => {
      if (!validateForm(true)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    form.addEventListener('reset', () => {
      form.querySelectorAll('input, textarea, select').forEach(el => {
        clearState(el);
        delete el.dataset.touched;
        if (el.setCustomValidity) el.setCustomValidity('');
      });
      const msg = form.querySelectorAll('input[type="password"]')[1]
        ?.parentElement.querySelector('.invalid-feedback');
      if (msg) msg.textContent = 'Confirm the password';
    });
  });
})();