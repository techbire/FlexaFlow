/**
 * FlexaFlow Dropdown Component
 * A highly customizable dropdown menu component
 */
export default class FlexaDropdown {
    constructor(targetSelector, options = {}) {
      this.target = typeof targetSelector === 'string' 
        ? document.querySelector(targetSelector) 
        : targetSelector;
        
      if (!this.target) {
        console.error('FlexaDropdown: Target element not found');
        return;
      }
  
      // Default options
      this.options = {
        placement: options.placement || 'bottom-start',
        trigger: options.trigger || 'click', // click, hover, manual
        items: options.items || [],
        onSelect: options.onSelect || null,
        closeOnSelect: options.closeOnSelect !== false,
        classes: options.classes || {},
        animation: options.animation !== false,
        arrow: options.arrow !== false,
        minWidth: options.minWidth || null,
        maxWidth: options.maxWidth || null,
        autoClose: options.autoClose !== false,
        zIndex: options.zIndex || 9999,
        offsetX: options.offsetX || 0,
        offsetY: options.offsetY || 0,
        appendTo: options.appendTo || 'body'
      };
  
      // State
      this.isOpen = false;
      this.dropdownMenu = null;
      
      // Initialize
      this._init();
    }
  
    /**
     * Initialize the dropdown
     * @private
     */
    _init() {
      // Create dropdown element
      this._createDropdown();
      
      // Add trigger events
      this._addEventListeners();
    }
  
    /**
     * Create dropdown menu element
     * @private
     */
    _createDropdown() {
      // Create container
      this.dropdownMenu = document.createElement('div');
      this.dropdownMenu.className = `ff-dropdown ff-absolute ff-z-${this.options.zIndex} ff-bg-white ff-rounded-md ff-shadow-lg ff-overflow-hidden ff-border ff-border-gray-200`;
      
      if (this.options.classes.dropdown) {
        this.dropdownMenu.className += ` ${this.options.classes.dropdown}`;
      }
      
      // Add animation classes if enabled
      if (this.options.animation) {
        this.dropdownMenu.className += ' ff-transition-all ff-duration-200 ff-transform ff-scale-95 ff-opacity-0';
      }
      
      // Set min/max width if specified
      if (this.options.minWidth) {
        this.dropdownMenu.style.minWidth = this.options.minWidth;
      } else {
        // Default: at least as wide as the target
        this.dropdownMenu.style.minWidth = this.target.offsetWidth + 'px';
      }
      
      if (this.options.maxWidth) {
        this.dropdownMenu.style.maxWidth = this.options.maxWidth;
      }
      
      // Hide by default
      this.dropdownMenu.style.display = 'none';
      
      // Set direction arrow if enabled
      if (this.options.arrow) {
        const arrow = document.createElement('div');
        arrow.className = 'ff-dropdown-arrow ff-absolute ff-w-3 ff-h-3 ff-bg-white ff-transform ff-rotate-45 ff-border ff-border-gray-200';
        this.dropdownMenu.appendChild(arrow);
      }
      
      // Create menu items
      if (this.options.items && this.options.items.length > 0) {
        const menuList = document.createElement('ul');
        menuList.className = 'ff-py-1';
        
        this.options.items.forEach(item => {
          if (item.type === 'divider') {
            const divider = document.createElement('hr');
            divider.className = 'ff-my-1 ff-border-t ff-border-gray-200';
            menuList.appendChild(divider);
            return;
          }
          
          if (item.type === 'header') {
            const header = document.createElement('li');
            header.className = 'ff-px-4 ff-py-2 ff-text-xs ff-font-semibold ff-text-gray-500 ff-uppercase';
            header.textContent = item.text || '';
            menuList.appendChild(header);
            return;
          }
          
          const menuItem = document.createElement('li');
          const itemClass = 'ff-px-4 ff-py-2 ff-text-sm ff-text-gray-700 ff-hover:ff-bg-gray-100 ff-cursor-pointer ff-flex ff-items-center';
          menuItem.className = itemClass + (item.disabled ? ' ff-opacity-50 ff-pointer-events-none' : '');
          
          // Add custom class if provided
          if (item.class) {
            menuItem.className += ` ${item.class}`;
          }
          
          if (item.icon) {
            const icon = document.createElement('span');
            icon.className = `ff-mr-2 ${item.icon.startsWith('<') ? '' : `fas fa-${item.icon}`}`;
            
            if (item.icon.startsWith('<')) {
              icon.innerHTML = item.icon;
            }
            
            menuItem.appendChild(icon);
          }
          
          const text = document.createElement('span');
          text.textContent = item.text || '';
          menuItem.appendChild(text);
          
          if (item.value !== undefined) {
            menuItem.dataset.value = item.value;
          }
          
          if (!item.disabled) {
            menuItem.addEventListener('click', () => {
              if (this.options.onSelect && typeof this.options.onSelect === 'function') {
                this.options.onSelect(item);
              }
              
              if (this.options.closeOnSelect) {
                this.close();
              }
            });
          }
          
          menuList.appendChild(menuItem);
        });
        
        this.dropdownMenu.appendChild(menuList);
      }
      
      // Append to document
      const container = this.options.appendTo === 'body' 
        ? document.body 
        : (typeof this.options.appendTo === 'string' 
            ? document.querySelector(this.options.appendTo) 
            : this.options.appendTo);
            
      if (container) {
        container.appendChild(this.dropdownMenu);
      } else {
        document.body.appendChild(this.dropdownMenu);
      }
    }
  
    /**
     * Add event listeners based on trigger type
     * @private
     */
    _addEventListeners() {
      // Click trigger
      if (this.options.trigger === 'click') {
        this.target.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
        
        // Close when clicking outside
        if (this.options.autoClose) {
          document.addEventListener('click', (e) => {
            if (this.isOpen && !this.dropdownMenu.contains(e.target) && e.target !== this.target) {
              this.close();
            }
          });
        }
      }
      
      // Hover trigger
      if (this.options.trigger === 'hover') {
        this.target.addEventListener('mouseenter', () => {
          this.open();
        });
        
        this.target.addEventListener('mouseleave', (e) => {
          // Check if hovering over the dropdown menu
          const relatedTarget = e.relatedTarget;
          if (relatedTarget !== this.dropdownMenu && !this.dropdownMenu.contains(relatedTarget)) {
            this.close();
          }
        });
        
        this.dropdownMenu.addEventListener('mouseleave', (e) => {
          // Check if hovering back over the target
          const relatedTarget = e.relatedTarget;
          if (relatedTarget !== this.target && !this.target.contains(relatedTarget)) {
            this.close();
          }
        });
      }
      
      // Close on ESC key
      if (this.options.autoClose) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) {
            this.close();
          }
        });
      }
    }
  
    /**
     * Position the dropdown relative to target
     * @private
     */
    _positionDropdown() {
      if (!this.dropdownMenu || !this.target) return;
      
      const targetRect = this.target.getBoundingClientRect();
      const docHeight = document.documentElement.clientHeight;
      const docWidth = document.documentElement.clientWidth;
      
      // Reset any inline styles for recalculation
      this.dropdownMenu.style.top = '';
      this.dropdownMenu.style.bottom = '';
      this.dropdownMenu.style.left = '';
      this.dropdownMenu.style.right = '';
      
      // Show temporarily to get dimensions
      const originalDisplay = this.dropdownMenu.style.display;
      this.dropdownMenu.style.display = 'block';
      this.dropdownMenu.style.visibility = 'hidden';
      const dropdownRect = this.dropdownMenu.getBoundingClientRect();
      this.dropdownMenu.style.display = originalDisplay;
      this.dropdownMenu.style.visibility = '';
      
      // Get scroll offsets
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate positions
      let top, left;
      
      // Horizontal positioning
      if (this.options.placement.includes('start')) {
        left = targetRect.left + scrollLeft + this.options.offsetX;
      } else if (this.options.placement.includes('end')) {
        left = targetRect.right - dropdownRect.width + scrollLeft + this.options.offsetX;
      } else {
        left = targetRect.left + (targetRect.width - dropdownRect.width) / 2 + scrollLeft + this.options.offsetX;
      }
      
      // Ensure dropdown stays within viewport horizontally
      if (left < 10) {
        left = 10;
      } else if (left + dropdownRect.width > docWidth - 10) {
        left = docWidth - dropdownRect.width - 10;
      }
      
      // Vertical positioning
      if (this.options.placement.includes('top')) {
        top = targetRect.top - dropdownRect.height + scrollTop + this.options.offsetY;
        
        // Update arrow position for top placement
        if (this.options.arrow) {
          const arrow = this.dropdownMenu.querySelector('.ff-dropdown-arrow');
          if (arrow) {
            arrow.style.top = 'auto';
            arrow.style.bottom = '-6px';
            arrow.style.borderTop = 'none';
            arrow.style.borderLeft = 'none';
            arrow.style.left = `${targetRect.left + targetRect.width / 2 - left}px`;
          }
        }
      } else {
        top = targetRect.bottom + scrollTop + this.options.offsetY;
        
        // Update arrow position for bottom placement
        if (this.options.arrow) {
          const arrow = this.dropdownMenu.querySelector('.ff-dropdown-arrow');
          if (arrow) {
            arrow.style.bottom = 'auto';
            arrow.style.top = '-6px';
            arrow.style.borderBottom = 'none';
            arrow.style.borderRight = 'none';
            arrow.style.left = `${targetRect.left + targetRect.width / 2 - left}px`;
          }
        }
      }
      
      // Check if dropdown would go off screen at bottom
      if (!this.options.placement.includes('top') && top + dropdownRect.height > docHeight) {
        // Switch to top if there's more room there
        if (targetRect.top > docHeight - targetRect.bottom) {
          top = targetRect.top - dropdownRect.height + scrollTop;
          
          // Update arrow for flipped position
          if (this.options.arrow) {
            const arrow = this.dropdownMenu.querySelector('.ff-dropdown-arrow');
            if (arrow) {
              arrow.style.top = 'auto';
              arrow.style.bottom = '-6px';
              arrow.style.borderTop = 'none';
              arrow.style.borderLeft = 'none';
            }
          }
        }
      }
      
      // Apply position
      this.dropdownMenu.style.top = `${top}px`;
      this.dropdownMenu.style.left = `${left}px`;
    }
  
    /**
     * Open the dropdown
     */
    open() {
      if (this.isOpen) return;
      
      // Show dropdown
      this.dropdownMenu.style.display = 'block';
      
      // Position dropdown
      this._positionDropdown();
      
      // Animate in if animation is enabled
      if (this.options.animation) {
        setTimeout(() => {
          this.dropdownMenu.classList.remove('ff-scale-95', 'ff-opacity-0');
          this.dropdownMenu.classList.add('ff-scale-100', 'ff-opacity-100');
        }, 10);
      }
      
      // Update state
      this.isOpen = true;
      
      // Add open attribute to target for styling
      this.target.setAttribute('aria-expanded', 'true');
      
      // Trigger open event
      this._triggerEvent('open');
    }
  
    /**
     * Close the dropdown
     */
    close() {
      if (!this.isOpen) return;
      
      // Animate out if animation is enabled
      if (this.options.animation) {
        this.dropdownMenu.classList.remove('ff-scale-100', 'ff-opacity-100');
        this.dropdownMenu.classList.add('ff-scale-95', 'ff-opacity-0');
        
        // Wait for animation before hiding
        setTimeout(() => {
          this.dropdownMenu.style.display = 'none';
        }, 200);
      } else {
        this.dropdownMenu.style.display = 'none';
      }
      
      // Update state
      this.isOpen = false;
      
      // Update target attribute
      this.target.setAttribute('aria-expanded', 'false');
      
      // Trigger close event
      this._triggerEvent('close');
    }
  
    /**
     * Toggle dropdown visibility
     */
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  
    /**
     * Update dropdown items
     * @param {Array} items - New items array
     */
    updateItems(items) {
      if (!Array.isArray(items)) return;
      
      this.options.items = items;
      
      // Remove current dropdown
      if (this.dropdownMenu) {
        this.dropdownMenu.remove();
      }
      
      // Create new dropdown with updated items
      this._createDropdown();
      
      // Re-initialize events
      this._addEventListeners();
      
      // Re-open if it was open
      if (this.isOpen) {
        this.open();
      }
    }
  
    /**
     * Update dropdown options
     * @param {Object} options - New options
     */
    updateOptions(options) {
      this.options = { ...this.options, ...options };
      
      // Recreate dropdown with new options
      if (this.dropdownMenu) {
        this.dropdownMenu.remove();
      }
      
      this._createDropdown();
      this._addEventListeners();
      
      // Re-open if it was open
      if (this.isOpen) {
        this.open();
      }
    }
  
    /**
     * Trigger custom event
     * @private
     * @param {string} eventName - Event name
     */
    _triggerEvent(eventName) {
      const event = new CustomEvent(`flexadropdown:${eventName}`, {
        bubbles: true,
        detail: {
          dropdown: this
        }
      });
      
      this.target.dispatchEvent(event);
    }
  
    /**
     * Destroy the dropdown and clean up
     */
    destroy() {
      // Remove dropdown from DOM
      if (this.dropdownMenu && this.dropdownMenu.parentNode) {
        this.dropdownMenu.parentNode.removeChild(this.dropdownMenu);
      }
      
      // Remove event listeners (unfortunately can't easily remove the bound listeners)
      
      // Reset target attributes
      this.target.removeAttribute('aria-expanded');
      
      // Clear references
      this.dropdownMenu = null;
      this.isOpen = false;
    }
  }