// src/components/ui/forms.js

/**
 * FlexaFlow Forms
 * A form validation and handling component
 */
export default class FlexaForms {
    /**
     * Create a new form handler
     * @param {string|HTMLElement} form - Form element or selector
     * @param {Object} options - Form configuration options
     */
    constructor(form, options = {}) {
      this.form = typeof form === 'string' 
        ? document.querySelector(form) 
        : form;
        
      if (!this.form || this.form.tagName !== 'FORM') {
        throw new Error('Invalid form element');
      }
      
      this.options = {
        validation: options.validation !== false,
        realtime: options.realtime === true,
        submitHandler: options.submitHandler || null,
        errorClass: options.errorClass || 'ff-form-error',
        successClass: options.successClass || 'ff-form-success',
        errorMessageClass: options.errorMessageClass || 'ff-error-message',
        customValidators: options.customValidators || {},
        showErrorsOnSubmit: options.showErrorsOnSubmit !== false,
        scrollToFirstError: options.scrollToFirstError !== false
      };
      
      this.validators = {
        required: (value) => !!value.trim() || 'This field is required',
        email: (value) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address',
        number: (value) => !value.trim() || !isNaN(Number(value)) || 'Must be a number',
        min: (value, attr) => !value.trim() || Number(value) >= Number(attr) || `Must be at least ${attr}`,
        max: (value, attr) => !value.trim() || Number(value) <= Number(attr) || `Must be at most ${attr}`,
        minLength: (value, attr) => !value.trim() || value.length >= Number(attr) || `Must be at least ${attr} characters`,
        maxLength: (value, attr) => !value.trim() || value.length <= Number(attr) || `Must be at most ${attr} characters`,
        pattern: (value, attr) => !value.trim() || new RegExp(attr).test(value) || 'Invalid format'
      };
      
      // Merge custom validators
      Object.assign(this.validators, this.options.customValidators);
      
      this.init();
    }
    
    /**
     * Initialize form handling
     * @private
     */
    init() {
      // Add novalidate attribute to disable browser validation
      if (this.options.validation) {
        this.form.setAttribute('novalidate', '');
      }
      
      // Add submit handler
      this.form.addEventListener('submit', this._handleSubmit.bind(this));
      
      // Add real-time validation if enabled
      if (this.options.validation && this.options.realtime) {
        this._addRealtimeValidation();
      }
      
      // Additional initialization for special inputs
      this._initSpecialInputs();
    }
    
    /**
     * Handle form submission
     * @private
     * @param {Event} event - Form submission event
     */
    _handleSubmit(event) {
      // Prevent default form submission
      event.preventDefault();
      
      let isValid = true;
      
      // Validate if enabled
      if (this.options.validation) {
        isValid = this.validate();
        
        if (!isValid && this.options.showErrorsOnSubmit) {
          return;
        }
      }
      
      // Get form data
      const formData = this._getFormData();
      
      // Call submit handler if provided
      if (typeof this.options.submitHandler === 'function') {
        this.options.submitHandler(formData, this.form, isValid);
      }
      
      // Dispatch form:submit event
      this.form.dispatchEvent(new CustomEvent('form:submit', {
        bubbles: true,
        detail: {
          data: formData,
          isValid
        }
      }));
    }
    
    /**
     * Add real-time validation to form inputs
     * @private
     */
    _addRealtimeValidation() {
      const inputs = this.form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        const events = ['input', 'blur', 'change'];
        
        events.forEach(event => {
          input.addEventListener(event, () => {
            this._validateInput(input);
          });
        });
      });
    }
    
    /**
     * Initialize special inputs like file inputs, date pickers, etc.
     * @private
     */
    _initSpecialInputs() {
      // File inputs
      const fileInputs = this.form.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        const wrapper = input.parentElement;
        
        if (wrapper && wrapper.classList.contains('ff-file-input')) {
          const label = wrapper.querySelector('.ff-file-label');
          
          if (label) {
            input.addEventListener('change', () => {
              if (input.files && input.files.length > 0) {
                const fileNames = Array.from(input.files).map(file => file.name).join(', ');
                label.textContent = fileNames;
                wrapper.classList.add('ff-has-file');
              } else {
                label.textContent = label.dataset.default || 'Choose file';
                wrapper.classList.remove('ff-has-file');
              }
            });
          }
        }
      });
    }
    
    /**
     * Get all form data as an object
     * @private
     * @returns {Object} - Form data object
     */
    _getFormData() {
      const formData = new FormData(this.form);
      const data = {};
      
      formData.forEach((value, key) => {
        if (data[key]) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });
      
      return data;
    }
    
    /**
     * Validate the entire form
     * @returns {boolean} - True if valid, false otherwise
     */
    validate() {
      const inputs = this.form.querySelectorAll('input, select, textarea');
      let isValid = true;
      let firstError = null;
      
      // Clear existing error messages
      this.clearErrors();
      
      // Validate each input
      inputs.forEach(input => {
        const inputValid = this._validateInput(input);
        
        if (!inputValid && !firstError) {
          firstError = input;
        }
        
        isValid = isValid && inputValid;
      });
      
      // Scroll to first error if needed
      if (!isValid && firstError && this.options.scrollToFirstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      
      return isValid;
    }
    
    /**
     * Validate a single input
     * @private
     * @param {HTMLElement} input - Input element to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    _validateInput(input) {
      // Skip disabled or hidden inputs
      if (input.disabled || input.type === 'hidden') {
        return true;
      }
      
      const validations = [];
      let isValid = true;
      let errorMessage = '';
      
      // Check required
      if (input.hasAttribute('required')) {
        validations.push(['required']);
      }
      
      // Check type
      if (input.type === 'email') {
        validations.push(['email']);
      } else if (input.type === 'number') {
        validations.push(['number']);
      }
      
      // Check min/max for number inputs
      if (input.type === 'number') {
        if (input.hasAttribute('min')) {
          validations.push(['min', input.getAttribute('min')]);
        }
        if (input.hasAttribute('max')) {
          validations.push(['max', input.getAttribute('max')]);
        }
      }
      
      // Check minLength/maxLength
      if (input.hasAttribute('minlength')) {
        validations.push(['minLength', input.getAttribute('minlength')]);
      }
      if (input.hasAttribute('maxlength')) {
        validations.push(['maxLength', input.getAttribute('maxlength')]);
      }
      
      // Check pattern
      if (input.hasAttribute('pattern')) {
        validations.push(['pattern', input.getAttribute('pattern')]);
      }
      
      // Check custom data validations
      Object.keys(this.validators).forEach(key => {
        if (input.hasAttribute(`data-validate-${key}`)) {
          validations.push([key, input.getAttribute(`data-validate-${key}`)]);
        }
      });
      
      // Run validations
      for (const [validatorName, attr] of validations) {
        const validator = this.validators[validatorName];
        
        if (validator) {
          const value = input.value;
          const result = validator(value, attr);
          
          if (result !== true && typeof result === 'string') {
            isValid = false;
            errorMessage = result;
            break;
          }
        }
      }
      
      // Toggle classes and show/hide error message
      const formGroup = this._getFormGroup(input);
      
      if (!isValid) {
        input.classList.add(this.options.errorClass);
        input.classList.remove(this.options.successClass);
        
        if (formGroup) {
          formGroup.classList.add(this.options.errorClass);
          formGroup.classList.remove(this.options.successClass);
        }
        
        this._showErrorMessage(input, errorMessage);
      } else {
        input.classList.remove(this.options.errorClass);
        input.classList.add(this.options.successClass);
        
        if (formGroup) {
          formGroup.classList.remove(this.options.errorClass);
          formGroup.classList.add(this.options.successClass);
        }
        
        this._clearErrorMessage(input);
      }
      
      return isValid;
    }
    
    /**
     * Get the form group element for an input
     * @private
     * @param {HTMLElement} input - Input element
     * @returns {HTMLElement|null} - Form group element or null
     */
    _getFormGroup(input) {
      // Check parents for form-group class
      let element = input.parentElement;
      
      while (element && !element.classList.contains('ff-form-group') && element !== this.form) {
        element = element.parentElement;
      }
      
      return element && element.classList.contains('ff-form-group') ? element : null;
    }
    
    /**
     * Show an error message for an input
     * @private
     * @param {HTMLElement} input - Input element
     * @param {string} message - Error message
     */
    _showErrorMessage(input, message) {
      this._clearErrorMessage(input);
      
      const formGroup = this._getFormGroup(input);
      const container = formGroup || input.parentElement;
      
      if (container) {
        const errorElement = document.createElement('div');
        errorElement.className = this.options.errorMessageClass;
        errorElement.textContent = message;
        
        container.appendChild(errorElement);
      }
    }
    
    /**
     * Clear the error message for an input
     * @private
     * @param {HTMLElement} input - Input element
     */
    _clearErrorMessage(input) {
      const formGroup = this._getFormGroup(input);
      const container = formGroup || input.parentElement;
      
      if (container) {
        const errorElement = container.querySelector(`.${this.options.errorMessageClass}`);
        
        if (errorElement) {
          errorElement.remove();
        }
      }
    }
    
    /**
     * Clear all errors in the form
     */
    clearErrors() {
      const errorMessages = this.form.querySelectorAll(`.${this.options.errorMessageClass}`);
      const errorInputs = this.form.querySelectorAll(`.${this.options.errorClass}`);
      
      errorMessages.forEach(error => error.remove());
      
      errorInputs.forEach(input => {
        input.classList.remove(this.options.errorClass);
      });
    }
    
    /**
     * Reset the form
     */
    reset() {
      this.form.reset();
      this.clearErrors();
      
      // Reset file inputs
      const fileInputs = this.form.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        const wrapper = input.parentElement;
        
        if (wrapper && wrapper.classList.contains('ff-file-input')) {
          const label = wrapper.querySelector('.ff-file-label');
          
          if (label) {
            label.textContent = label.dataset.default || 'Choose file';
            wrapper.classList.remove('ff-has-file');
          }
        }
      });
    }
    
    /**
     * Get or set form values
     * @param {Object} values - Form values to set (optional)
     * @returns {Object|undefined} - Current form values if getting
     */
    values(values) {
      if (values) {
        // Set values
        Object.entries(values).forEach(([name, value]) => {
          const inputs = this.form.querySelectorAll(`[name="${name}"]`);
          
          inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
              input.checked = Array.isArray(value) 
                ? value.includes(input.value)
                : input.value === value;
            } else if (input.type !== 'file') {
              input.value = value;
            }
          });
        });
        
        return undefined;
      } else {
        // Get values
        return this._getFormData();
      }
    }
    
    /**
     * Add a custom validator
     * @param {string} name - Validator name
     * @param {Function} validator - Validator function
     */
    addValidator(name, validator) {
      if (typeof validator === 'function') {
        this.validators[name] = validator;
      }
    }
    
    /**
     * Make specific inputs readonly
     * @param {Array} names - Input names to make readonly
     */
    makeReadonly(names) {
      names.forEach(name => {
        const inputs = this.form.querySelectorAll(`[name="${name}"]`);
        
        inputs.forEach(input => {
          input.setAttribute('readonly', '');
          input.classList.add('ff-readonly');
        });
      });
    }
  }