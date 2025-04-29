// src/components/ui/loaders.js

/**
 * FlexaFlow Loaders
 * Loading indicators and spinners for async operations
 */
export default class FlexaLoaders {
    /**
     * Create a loader instance
     * @param {Object} options - Loader configuration options
     */
    constructor(options = {}) {
      this.options = {
        size: options.size || 'md',
        color: options.color || 'primary',
        type: options.type || 'spinner',
        fullscreen: options.fullscreen === true,
        message: options.message || '',
        zIndex: options.zIndex || 9999,
        container: options.container || document.body
      };
      
      this.activeLoaders = new Map();
    }
    
    /**
     * Create a spinner element
     * @param {Object} options - Override default options
     * @returns {HTMLElement} - Spinner element
     */
    createSpinner(options = {}) {
      const opts = { ...this.options, ...options };
      
      const spinner = document.createElement('div');
      spinner.className = `ff-spinner ff-spinner-${opts.type} ff-spinner-${opts.size} ff-spinner-${opts.color}`;
      
      // Add spinner type-specific elements
      if (opts.type === 'spinner') {
        spinner.innerHTML = `<div class="ff-spinner-ring"></div>`;
      } else if (opts.type === 'dots') {
        spinner.innerHTML = `
          <div class="ff-spinner-dot"></div>
          <div class="ff-spinner-dot"></div>
          <div class="ff-spinner-dot"></div>
        `;
      } else if (opts.type === 'pulse') {
        spinner.innerHTML = `
          <div class="ff-spinner-pulse"></div>
          <div class="ff-spinner-pulse"></div>
          <div class="ff-spinner-pulse"></div>
        `;
      }
      
      return spinner;
    }
    
    /**
     * Show a loader
     * @param {Object} options - Override default options
     * @returns {string} - Loader ID
     */
    show(options = {}) {
      const opts = { ...this.options, ...options };
      const id = 'loader-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      
      // Create loader container
      const loaderContainer = document.createElement('div');
      loaderContainer.className = `ff-loader-container ${opts.fullscreen ? 'ff-loader-fullscreen' : ''}`;
      loaderContainer.style.zIndex = opts.zIndex;
      
      // Create loader content
      const loaderContent = document.createElement('div');
      loaderContent.className = 'ff-loader-content';
      
      // Add spinner
      const spinner = this.createSpinner(opts);
      loaderContent.appendChild(spinner);
      
      // Add message if provided
      if (opts.message) {
        const message = document.createElement('div');
        message.className = 'ff-loader-message';
        message.textContent = opts.message;
        loaderContent.appendChild(message);
      }
      
      // Add to container
      loaderContainer.appendChild(loaderContent);
      
      // Add to DOM
      const container = typeof opts.container === 'string' 
        ? document.querySelector(opts.container) 
        : opts.container;
        
      if (container) {
        // Add positioning context to container if needed
        const computedStyle = window.getComputedStyle(container);
        if (computedStyle.position === 'static') {
          container.style.position = 'relative';
        }
        
        container.appendChild(loaderContainer);
        
        // Store reference
        this.activeLoaders.set(id, {
          element: loaderContainer,
          container
        });
        
        return id;
      }
      
      return null;
    }
    
    /**
     * Hide a loader by ID
     * @param {string} id - Loader ID
     * @param {Object} options - Hide options
     */
    hide(id, options = {}) {
      const loader = this.activeLoaders.get(id);
      
      if (!loader) return;
      
      const opts = {
        animation: true,
        delay: 0,
        ...options
      };
      
      const hideLoader = () => {
        if (opts.animation) {
          loader.element.classList.add('ff-loader-hiding');
          
          setTimeout(() => {
            if (loader.element.parentNode) {
              loader.element.parentNode.removeChild(loader.element);
            }
            this.activeLoaders.delete(id);
          }, 300);
        } else {
          if (loader.element.parentNode) {
            loader.element.parentNode.removeChild(loader.element);
          }
          this.activeLoaders.delete(id);
        }
      };
      
      if (opts.delay > 0) {
        setTimeout(hideLoader, opts.delay);
      } else {
        hideLoader();
      }
    }
    
    /**
     * Hide all active loaders
     */
    hideAll() {
      this.activeLoaders.forEach((_, id) => {
        this.hide(id);
      });
    }
    
    /**
     * Create a button loader
     * @param {HTMLElement} button - Button element
     * @param {Object} options - Loader options
     * @returns {Function} - Reset function
     */
    buttonLoader(button, options = {}) {
      if (!button) return;
      
      const originalContent = button.innerHTML;
      const originalWidth = button.offsetWidth;
      const originalDisabled = button.disabled;
      
      // Save original width
      button.style.minWidth = `${originalWidth}px`;
      
      // Disable button
      button.disabled = true;
      
      // Add loading class
      button.classList.add('ff-button-loading');
      
      // Create spinner
      const spinner = this.createSpinner({
        size: 'sm',
        color: options.color || 'light',
        type: options.type || 'spinner'
      });
      
      // Set button content
      if (options.keepText) {
        button.innerHTML = `${spinner.outerHTML} ${options.text || button.textContent}`;
      } else {
        button.innerHTML = spinner.outerHTML;
        
        if (options.text) {
          button.innerHTML += ` ${options.text}`;
        }
      }
      
      // Return reset function
      return () => {
        button.innerHTML = originalContent;
        button.disabled = originalDisabled;
        button.classList.remove('ff-button-loading');
        
        // Remove explicit width after a short delay
        setTimeout(() => {
          button.style.minWidth = '';
        }, 300);
      };
    }
    
    /**
     * Create a section loader
     * @param {string|HTMLElement} selector - Container element or selector
     * @param {Object} options - Loader options
     * @returns {Function} - Reset function
     */
    sectionLoader(selector, options = {}) {
      const container = typeof selector === 'string' 
        ? document.querySelector(selector) 
        : selector;
        
      if (!container) return;
      
      // Store original content and styles
      const originalContent = container.innerHTML;
      const originalPosition = container.style.position;
      const originalHeight = container.style.height;
      const minHeight = options.minHeight || '200px';
      
      // Set container styles
      container.style.position = 'relative';
      container.style.minHeight = minHeight;
      
      // Clear content if specified
      if (options.clearContent) {
        container.innerHTML = '';
      }
      
      // Add overlay
      const overlay = document.createElement('div');
      overlay.className = 'ff-section-loader';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.zIndex = options.zIndex || 10;
      
      // Create loader content
      const loaderContent = document.createElement('div');
      loaderContent.className = 'ff-section-loader-content';
      
      // Add spinner
      const spinner = this.createSpinner({
        size: options.size || 'md',
        color: options.color || 'primary',
        type: options.type || 'spinner'
      });
      loaderContent.appendChild(spinner);
      
      // Add message if provided
      if (options.message) {
        const message = document.createElement('div');
        message.className = 'ff-section-loader-message';
        message.style.marginTop = '10px';
        message.textContent = options.message;
        loaderContent.appendChild(message);
      }
      
      overlay.appendChild(loaderContent);
      container.appendChild(overlay);
      
      // Return reset function
      return () => {
        if (options.clearContent) {
          container.innerHTML = originalContent;
        } else {
          container.removeChild(overlay);
        }
        
        if (originalPosition) {
          container.style.position = originalPosition;
        } else {
          container.style.position = '';
        }
        
        if (originalHeight) {
          container.style.minHeight = originalHeight;
        } else {
          container.style.minHeight = '';
        }
      };
    }
  }