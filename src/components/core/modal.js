// src/components/core/modal.js

/**
 * FlexaFlow Modal System
 * A flexible, accessible modal dialog component
 */
export default class FlexaModal {
    constructor(options = {}) {
      this.options = {
        closeOnEscape: options.closeOnEscape !== false,
        closeOnOutsideClick: options.closeOnOutsideClick !== false,
        backdrop: options.backdrop !== false,
        animated: options.animated !== false,
        beforeOpen: options.beforeOpen || null,
        afterOpen: options.afterOpen || null,
        beforeClose: options.beforeClose || null,
        afterClose: options.afterClose || null,
        backdropClass: options.backdropClass || '',
        modalClass: options.modalClass || '',
        contentClass: options.contentClass || '',
        zIndex: options.zIndex || 9999
      };
      
      this.modals = new Map();
      this._bodyOriginalStyles = null;
      this._addEventListeners();
    }
    
    /**
     * Create a new modal
     * @param {Object} options - Modal options
     * @param {string} options.id - Unique modal identifier
     * @param {string|HTMLElement} options.content - Modal content (HTML string or element)
     * @param {string} options.title - Modal title
     * @param {boolean} options.showHeader - Whether to show the header
     * @param {boolean} options.showFooter - Whether to show the footer
     * @param {Array} options.buttons - Array of button configurations
     * @param {string} options.size - Modal size (sm, md, lg, xl, full)
     * @param {boolean} options.draggable - Whether modal is draggable
     * @returns {Object} - Modal instance
     */
    create(options) {
      const id = options.id || 'flexaflow-modal-' + Date.now();
      
      // If modal already exists, destroy it first
      if (this.modals.has(id)) {
        this.destroy(id);
      }
      
      // Create modal element
      const modal = this._createModalElement(id, options);
      
      // Store modal data
      this.modals.set(id, {
        element: modal,
        options,
        isOpen: false
      });
      
      // Append to body
      document.body.appendChild(modal);
      
      return {
        id,
        open: () => this.open(id),
        close: () => this.close(id),
        destroy: () => this.destroy(id),
        update: (newContent) => this.update(id, newContent),
        getElement: () => this.modals.get(id)?.element
      };
    }
    
    /**
     * Create modal DOM element
     * @private
     * @param {string} id - Modal ID
     * @param {Object} options - Modal options
     * @returns {HTMLElement} - Modal element
     */
    _createModalElement(id, options) {
      // Create modal element
      const modal = document.createElement('div');
      modal.id = id;
      modal.className = `ff-modal ff-fixed ff-inset-0 ff-bg-black ff-bg-opacity-50 ff-flex ff-items-center ff-justify-center ff-z-${this.options.zIndex} ff-hidden`;
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', `${id}-title`);
      
      // Add backdrop class if specified
      if (this.options.backdropClass) {
        this.options.backdropClass.split(' ').forEach(cls => {
          modal.classList.add(cls);
        });
      }
      
      // Add animation classes if enabled
      if (this.options.animated) {
        modal.classList.add('ff-transition-opacity', 'ff-duration-300', 'ff-opacity-0');
      }
      
      // Determine modal size
      const sizeClasses = {
        'sm': 'ff-max-w-sm',
        'md': 'ff-max-w-md',
        'lg': 'ff-max-w-lg',
        'xl': 'ff-max-w-xl',
        '2xl': 'ff-max-w-2xl',
        'full': 'ff-max-w-full ff-mx-4'
      };
      
      const modalSize = options.size || 'md';
      
      // Create modal inner content
      modal.innerHTML = `
        <div class="ff-modal-content ff-bg-white ff-rounded-lg ff-shadow-xl ff-w-full ${sizeClasses[modalSize]} ff-max-h-[90vh] ff-overflow-hidden ff-relative ${this.options.animated ? 'ff-transform ff-transition-transform ff-duration-300 ff-scale-90' : ''} ${this.options.modalClass}">
          ${options.showHeader !== false ? `
            <div class="ff-modal-header ff-flex ff-items-center ff-justify-between ff-p-4 ff-border-b ff-border-gray-200">
              <h3 class="ff-modal-title ff-text-lg ff-font-semibold ff-text-gray-900" id="${id}-title">
                ${options.title || 'Modal Title'}
              </h3>
              <button type="button" class="ff-modal-close ff-text-gray-400 ff-bg-transparent ff-hover:ff-bg-gray-200 ff-hover:ff-text-gray-900 ff-rounded-lg ff-w-8 ff-h-8 ff-flex ff-items-center ff-justify-center" aria-label="Close">
                <svg class="ff-w-4 ff-h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          ` : ''}
          
          <div class="ff-modal-body ff-p-4 ff-overflow-y-auto ${this.options.contentClass}">
            ${this._parseContent(options.content)}
          </div>
          
          ${options.buttons && options.buttons.length > 0 && options.showFooter !== false ? `
            <div class="ff-modal-footer ff-flex ff-items-center ff-justify-end ff-p-4 ff-border-t ff-border-gray-200 ff-space-x-2">
              ${options.buttons.map(btn => `
                <button type="button" class="ff-modal-btn ff-modal-btn-${btn.type || 'secondary'} ff-px-4 ff-py-2 ff-rounded-md ff-text-sm ff-transition-colors" data-action="${btn.action || ''}">
                  ${btn.text || 'Button'}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
      
      // Add event listeners
      modal.querySelector('.ff-modal-close')?.addEventListener('click', () => {
        this.close(id);
      });
      
      // Add button event listeners
      if (options.buttons && options.buttons.length > 0) {
        const buttons = modal.querySelectorAll('.ff-modal-btn');
        buttons.forEach((btn, index) => {
          const buttonConfig = options.buttons[index];
          btn.addEventListener('click', () => {
            if (buttonConfig.callback && typeof buttonConfig.callback === 'function') {
              buttonConfig.callback();
            }
            
            if (buttonConfig.closeOnClick !== false) {
              this.close(id);
            }
          });
        });
      }
      
      // Make modal draggable if requested
      if (options.draggable) {
        this._makeModalDraggable(modal);
      }
      
      return modal;
    }
    
    /**
     * Parse content from various input types
     * @private
     * @param {string|HTMLElement} content - Modal content
     * @returns {string} - HTML content
     */
    _parseContent(content) {
      if (!content) return '';
      
      if (typeof content === 'string') {
        return content;
      }
      
      if (content instanceof HTMLElement) {
        return content.outerHTML;
      }
      
      return String(content);
    }
    
    /**
     * Make a modal draggable
     * @private
     * @param {HTMLElement} modal - Modal element
     */
    _makeModalDraggable(modal) {
      const modalContent = modal.querySelector('.ff-modal-content');
      const header = modal.querySelector('.ff-modal-header');
      
      if (!modalContent || !header) return;
      
      let isDragging = false;
      let offsetX, offsetY;
      
      // Add cursor style to indicate draggable
      header.style.cursor = 'move';
      
      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Calculate offset from the modal content position
        const rect = modalContent.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Add absolute positioning
        modalContent.style.position = 'absolute';
        modalContent.style.margin = '0';
        modalContent.style.zIndex = (this.options.zIndex + 10).toString();
        
        // Update initial position
        modalContent.style.left = rect.left + 'px';
        modalContent.style.top = rect.top + 'px';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // Update position
        modalContent.style.left = (e.clientX - offsetX) + 'px';
        modalContent.style.top = (e.clientY - offsetY) + 'px';
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }
    
    /**
     * Open a modal by ID
     * @param {string} id - Modal ID
     * @returns {boolean} - Success status
     */
    open(id) {
      const modal = this.modals.get(id);
      if (!modal) return false;
      
      // Check if already open
      if (modal.isOpen) return true;
      
      // Run before open callback
      if (this.options.beforeOpen && typeof this.options.beforeOpen === 'function') {
        const shouldContinue = this.options.beforeOpen(id, modal);
        if (shouldContinue === false) return false;
      }
      
      // Save original body styles
      this._bodyOriginalStyles = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight
      };
      
      // Prevent body scrolling
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollbarWidth + 'px';
      
      // Show modal
      modal.element.classList.remove('ff-hidden');
      
      // Trigger animations
      if (this.options.animated) {
        setTimeout(() => {
          modal.element.classList.remove('ff-opacity-0');
          const modalContent = modal.element.querySelector('.ff-modal-content');
          if (modalContent) {
            modalContent.classList.remove('ff-scale-90');
          }
        }, 10);
      }
      
      // Update state
      modal.isOpen = true;
      
      // Set focus on first focusable element
      setTimeout(() => {
        const focusable = modal.element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
          focusable[0].focus();
        }
      }, 100);
      
      // Run after open callback
      if (this.options.afterOpen && typeof this.options.afterOpen === 'function') {
        setTimeout(() => {
          this.options.afterOpen(id, modal);
        }, this.options.animated ? 300 : 0);
      }
      
      return true;
    }
    
    /**
     * Close a modal by ID
     * @param {string} id - Modal ID
     * @returns {boolean} - Success status
     */
    close(id) {
      const modal = this.modals.get(id);
      if (!modal || !modal.isOpen) return false;
      
      // Run before close callback
      if (this.options.beforeClose && typeof this.options.beforeClose === 'function') {
        const shouldContinue = this.options.beforeClose(id, modal);
        if (shouldContinue === false) return false;
      }
      
      // Hide with animation
      if (this.options.animated) {
        modal.element.classList.add('ff-opacity-0');
        
        const modalContent = modal.element.querySelector('.ff-modal-content');
        if (modalContent) {
          modalContent.classList.add('ff-scale-90');
        }
        
        // Wait for animation to finish
        setTimeout(() => {
          modal.element.classList.add('ff-hidden');
          modal.isOpen = false;
          
          // Check if this was the last open modal
          const anyModalOpen = Array.from(this.modals.values()).some(m => m.isOpen);
          if (!anyModalOpen) {
            // Restore body styles
            this._restoreBodyStyles();
          }
          
          // Run after close callback
          if (this.options.afterClose && typeof this.options.afterClose === 'function') {
            this.options.afterClose(id, modal);
          }
        }, 300);
      } else {
        // Hide immediately
        modal.element.classList.add('ff-hidden');
        modal.isOpen = false;
        
        // Check if this was the last open modal
        const anyModalOpen = Array.from(this.modals.values()).some(m => m.isOpen);
        if (!anyModalOpen) {
          // Restore body styles
          this._restoreBodyStyles();
        }
        
        // Run after close callback
        if (this.options.afterClose && typeof this.options.afterClose === 'function') {
          this.options.afterClose(id, modal);
        }
      }
      
      return true;
    }
    
    /**
     * Update modal content
     * @param {string} id - Modal ID
     * @param {string|HTMLElement} content - New content
     * @returns {boolean} - Success status
     */
    update(id, content) {
      const modal = this.modals.get(id);
      if (!modal) return false;
      
      const modalBody = modal.element.querySelector('.ff-modal-body');
      if (!modalBody) return false;
      
      modalBody.innerHTML = this._parseContent(content);
      return true;
    }
    
    /**
     * Destroy a modal by ID
     * @param {string} id - Modal ID
     * @returns {boolean} - Success status
     */
    destroy(id) {
      const modal = this.modals.get(id);
      if (!modal) return false;
      
      // If open, close first (without animations)
      if (modal.isOpen) {
        // Save animation setting
        const wasAnimated = this.options.animated;
        this.options.animated = false;
        
        this.close(id);
        
        // Restore animation setting
        this.options.animated = wasAnimated;
      }
      
      // Remove from DOM
      modal.element.remove();
      
      // Remove from storage
      return this.modals.delete(id);
    }
    
    /**
     * Add global event listeners
     * @private
     */
    _addEventListeners() {
      // Close on ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.options.closeOnEscape) {
          // Find the topmost open modal
          const openModals = Array.from(this.modals.entries())
            .filter(([_, modal]) => modal.isOpen)
            .sort((a, b) => {
              const zIndexA = parseInt(window.getComputedStyle(a[1].element).zIndex, 10) || this.options.zIndex;
              const zIndexB = parseInt(window.getComputedStyle(b[1].element).zIndex, 10) || this.options.zIndex;
              return zIndexB - zIndexA;
            });
            
          if (openModals.length > 0) {
            this.close(openModals[0][0]);
          }
        }
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.options.closeOnOutsideClick) return;
        
        this.modals.forEach((modal, id) => {
          if (modal.isOpen && e.target === modal.element) {
            this.close(id);
          }
        });
      });
    }
    
    /**
     * Restore body styles after all modals are closed
     * @private
     */
    _restoreBodyStyles() {
      if (!this._bodyOriginalStyles) return;
      
      document.body.style.overflow = this._bodyOriginalStyles.overflow || '';
      document.body.style.paddingRight = this._bodyOriginalStyles.paddingRight || '';
      
      this._bodyOriginalStyles = null;
    }
    
    /**
     * Close all open modals
     */
    closeAll() {
      this.modals.forEach((_, id) => {
        this.close(id);
      });
    }
  }