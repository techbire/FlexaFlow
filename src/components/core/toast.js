// src/components/core/toast.js

/**
 * FlexaFlow Toast Notification System
 * A customizable, accessible toast notification system
 */
export default class FlexaToast {
    constructor(options = {}) {
      this.options = {
        position: options.position || 'bottom-right',
        duration: options.duration || 5000,
        maxToasts: options.maxToasts || 5,
        animation: options.animation || 'slide',
        containerClass: options.containerClass || '',
        zIndex: options.zIndex || 9999
      };
      
      this.toasts = [];
      this.container = null;
      this.initialized = false;
    }
  
    /**
     * Initialize the toast container
     * @private
     */
    _initContainer() {
      if (this.initialized) return;
      
      // Create container
      this.container = document.createElement('div');
      this.container.id = 'flexaflow-toast-container';
      
      // Set position classes
      const positionClasses = {
        'top-right': 'ff-fixed ff-top-4 ff-right-4',
        'top-left': 'ff-fixed ff-top-4 ff-left-4',
        'bottom-right': 'ff-fixed ff-bottom-4 ff-right-4',
        'bottom-left': 'ff-fixed ff-bottom-4 ff-left-4',
        'top-center': 'ff-fixed ff-top-4 ff-left-1/2 ff-transform ff--translate-x-1/2',
        'bottom-center': 'ff-fixed ff-bottom-4 ff-left-1/2 ff-transform ff--translate-x-1/2'
      };
  
      const baseClasses = `ff-flex ff-flex-col ff-z-${this.options.zIndex} ff-pointer-events-none`;
      this.container.className = `${baseClasses} ${positionClasses[this.options.position] || positionClasses['bottom-right']} ${this.options.containerClass}`;
      
      document.body.appendChild(this.container);
      this.initialized = true;
    }
  
    /**
     * Show a toast notification
     * @param {Object} options - Toast configuration
     * @param {string} options.message - Toast message content
     * @param {string} options.type - Toast type (success, error, info, warning)
     * @param {number} options.duration - Display duration in ms
     * @param {Function} options.onClose - Callback when toast is closed
     * @param {boolean} options.dismissible - Whether toast can be closed manually
     * @returns {Object} - Toast instance
     */
    show(options) {
      this._initContainer();
      
      // Manage toast limit
      if (this.toasts.length >= this.options.maxToasts) {
        this._removeToast(this.toasts[0].id);
      }
      
      const toast = this._createToast(options);
      this.container.appendChild(toast.element);
      
      // Add to tracked toasts
      this.toasts.push(toast);
      
      // Trigger animation after a small delay (for proper transitions)
      setTimeout(() => {
        toast.element.classList.add('ff-toast-visible');
      }, 10);
      
      // Auto close after duration
      const duration = options.duration || this.options.duration;
      if (duration !== Infinity) {
        toast.timerId = setTimeout(() => {
          this.close(toast.id);
        }, duration);
      }
      
      return toast;
    }
    
    /**
     * Create a toast element
     * @private
     * @param {Object} options - Toast options
     * @returns {Object} - Toast object
     */
    _createToast(options) {
      const id = 'toast-' + Date.now() + '-' + Math.round(Math.random() * 1000);
      
      // Create toast element
      const toastEl = document.createElement('div');
      toastEl.className = `ff-toast ff-pointer-events-auto ff-mb-3 ff-p-4 ff-rounded-lg ff-shadow-lg ff-flex ff-items-center ff-justify-between ff-min-w-[300px] ff-transform ${this._getAnimationClass()} ff-transition-all ff-duration-300`;
      
      // Add type-specific classes
      const typeClasses = {
        'success': 'ff-bg-green-500 ff-text-white',
        'error': 'ff-bg-red-500 ff-text-white',
        'warning': 'ff-bg-amber-500 ff-text-white',
        'info': 'ff-bg-blue-500 ff-text-white'
      };
      
      toastEl.classList.add(...(typeClasses[options.type] || typeClasses['info']).split(' '));
      
      // Add icon based on type
      const iconMap = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
      };
      
      const icon = iconMap[options.type] || iconMap['info'];
      
      // Create toast content
      toastEl.innerHTML = `
        <div class="ff-flex ff-items-center ff-overflow-hidden">
          <i class="fas fa-${icon} ff-mr-3"></i>
          <span class="ff-toast-message ff-pr-2 ff-overflow-hidden ff-text-ellipsis">${options.message}</span>
        </div>
        ${options.dismissible !== false ? `
          <button class="ff-toast-close ff-ml-4 ff-text-white ff-hover:ff-text-gray-200 ff-focus:ff-outline-none" aria-label="Close notification">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      `;
      
      // Add accessibility attributes
      toastEl.setAttribute('role', 'alert');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.id = id;
      
      // Add close handler if dismissible
      if (options.dismissible !== false) {
        const closeBtn = toastEl.querySelector('.ff-toast-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            this.close(id);
          });
        }
      }
      
      // Create toast object
      const toast = {
        id,
        element: toastEl,
        type: options.type,
        onClose: options.onClose,
        timerId: null
      };
      
      return toast;
    }
    
    /**
     * Close a toast by ID
     * @param {string} id - Toast ID
     */
    close(id) {
      this._removeToast(id);
    }
    
    /**
     * Remove a toast from the DOM and the internal array
     * @private
     * @param {string} id - Toast ID
     */
    _removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index === -1) return;
      
      const toast = this.toasts[index];
      
      // Clear auto-close timer if it exists
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
      
      // Run exit animation
      toast.element.classList.remove('ff-toast-visible');
      toast.element.classList.add('ff-toast-hiding');
      
      // Remove after animation
      setTimeout(() => {
        if (toast.onClose && typeof toast.onClose === 'function') {
          toast.onClose();
        }
        
        toast.element.remove();
        this.toasts.splice(index, 1);
        
        // Clean up container if empty
        if (this.toasts.length === 0 && this.container && this.options.autoClean) {
          this.container.remove();
          this.initialized = false;
        }
      }, 300);
    }
    
    /**
     * Get the animation class based on position and animation type
     * @private
     * @returns {string} - CSS animation class
     */
    _getAnimationClass() {
      const pos = this.options.position;
      const anim = this.options.animation;
      
      if (anim === 'fade') {
        return 'ff-opacity-0';
      }
      
      // Default to slide animation
      if (pos.includes('top')) {
        return 'ff--translate-y-full ff-opacity-0';
      } else if (pos.includes('bottom')) {
        return 'ff-translate-y-full ff-opacity-0';
      } else if (pos.includes('left')) {
        return 'ff--translate-x-full ff-opacity-0';
      } else {
        return 'ff-translate-x-full ff-opacity-0';
      }
    }
    
    /**
     * Convenience method to show a success toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {Object} - Toast instance
     */
    success(message, options = {}) {
      return this.show({
        ...options,
        message,
        type: 'success'
      });
    }
    
    /**
     * Convenience method to show an error toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {Object} - Toast instance
     */
    error(message, options = {}) {
      return this.show({
        ...options,
        message,
        type: 'error'
      });
    }
    
    /**
     * Convenience method to show a warning toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {Object} - Toast instance
     */
    warning(message, options = {}) {
      return this.show({
        ...options,
        message,
        type: 'warning'
      });
    }
    
    /**
     * Convenience method to show an info toast
     * @param {string} message - Toast message
     * @param {Object} options - Additional options
     * @returns {Object} - Toast instance
     */
    info(message, options = {}) {
      return this.show({
        ...options,
        message,
        type: 'info'
      });
    }
    
    /**
     * Clear all toasts
     */
    clearAll() {
      this.toasts.forEach(toast => {
        this.close(toast.id);
      });
    }
  }