// src/components/ui/filters.js

/**
 * FlexaFlow Filters
 * A versatile filtering component for content
 */
export default class FlexaFilters {
    /**
     * Create a new filter system
     * @param {string|HTMLElement} container - Container element or selector
     * @param {Object} options - Filter configuration options
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
        
      if (!this.container) {
        throw new Error('Filter container not found');
      }
      
      this.options = {
        theme: options.theme || 'default',
        layout: options.layout || 'horizontal',
        activeFilter: options.activeFilter || 'all',
        showClear: options.showClear !== false,
        showIndicator: options.showIndicator !== false,
        animation: options.animation !== false,
        filters: options.filters || [],
        onChange: options.onChange || null
      };
      
      this.filterContainer = null;
      this.activeFilterContainer = null;
      this.buttons = new Map();
      
      this.init();
    }
    
    /**
     * Initialize the filter system
     * @private
     */
    init() {
      this._createFilterUI();
      this._addEventListeners();
      
      // Set initial active filter
      if (this.options.activeFilter && this.options.activeFilter !== 'all') {
        this.setActive(this.options.activeFilter);
      }
    }
    
    /**
     * Create filter UI elements
     * @private
     */
    _createFilterUI() {
      // Create main wrapper
      this.filterContainer = document.createElement('div');
      this.filterContainer.className = `ff-filter-container ff-filter-${this.options.layout} ff-filter-theme-${this.options.theme}`;
      
      // Create filter buttons wrapper
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.className = 'ff-filter-buttons';
      
      // Add 'All' filter if not in options
      const hasAllFilter = this.options.filters.some(f => f.id === 'all');
      
      if (!hasAllFilter) {
        const allFilter = {
          id: 'all',
          name: 'All',
          active: true
        };
        
        this.options.filters.unshift(allFilter);
      }
      
      // Create filter buttons
      this.options.filters.forEach(filter => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `ff-filter-btn ${filter.active || filter.id === this.options.activeFilter ? 'ff-filter-btn-active' : ''}`;
        button.dataset.filterId = filter.id;
        button.textContent = filter.name;
        
        if (filter.icon) {
          button.innerHTML = `<i class="${filter.icon}"></i> ${button.textContent}`;
        }
        
        buttonsWrapper.appendChild(button);
        this.buttons.set(filter.id, button);
      });
      
      // Create active filter indicator
      if (this.options.showIndicator) {
        this.activeFilterContainer = document.createElement('div');
        this.activeFilterContainer.className = 'ff-filter-active-indicator';
        this.activeFilterContainer.innerHTML = `
          <span class="ff-filter-label">Showing:</span>
          <span class="ff-filter-active-name">All</span>
        `;
        
        if (this.options.activeFilter === 'all') {
          this.activeFilterContainer.classList.add('ff-hidden');
        }
      }
      
      // Create clear filter button
      if (this.options.showClear) {
        this.clearButton = document.createElement('button');
        this.clearButton.type = 'button';
        this.clearButton.className = 'ff-filter-clear-btn';
        this.clearButton.innerHTML = `<i class="fas fa-times"></i> Clear Filter`;
        
        if (this.options.activeFilter === 'all') {
          this.clearButton.classList.add('ff-hidden');
        }
      }
      
      // Append all elements
      this.filterContainer.appendChild(buttonsWrapper);
      
      if (this.options.showIndicator && this.activeFilterContainer) {
        this.filterContainer.appendChild(this.activeFilterContainer);
      }
      
      if (this.options.showClear && this.clearButton) {
        this.filterContainer.appendChild(this.clearButton);
      }
      
      // Add to main container
      this.container.appendChild(this.filterContainer);
    }
    
    /**
     * Add event listeners to filter buttons
     * @private
     */
    _addEventListeners() {
      // Filter button click events
      this.buttons.forEach((button, filterId) => {
        button.addEventListener('click', () => {
          this.setActive(filterId);
        });
      });
      
      // Clear button click event
      if (this.clearButton) {
        this.clearButton.addEventListener('click', () => {
          this.reset();
        });
      }
    }
    
    /**
     * Set an active filter
     * @param {string} filterId - ID of the filter to set as active
     */
    setActive(filterId) {
      // Skip if already active
      if (this.options.activeFilter === filterId) return;
      
      // Update active state in buttons
      this.buttons.forEach((button, id) => {
        if (id === filterId) {
          button.classList.add('ff-filter-btn-active');
        } else {
          button.classList.remove('ff-filter-btn-active');
        }
      });
      
      // Update active filter indicator
      if (this.activeFilterContainer) {
        const activeName = this.activeFilterContainer.querySelector('.ff-filter-active-name');
        if (activeName) {
          const activeFilterObj = this.options.filters.find(f => f.id === filterId);
          activeName.textContent = activeFilterObj ? activeFilterObj.name : 'All';
        }
        
        // Show/hide indicator
        if (filterId === 'all') {
          this.activeFilterContainer.classList.add('ff-hidden');
        } else {
          this.activeFilterContainer.classList.remove('ff-hidden');
        }
      }
      
      // Show/hide clear button
      if (this.clearButton) {
        if (filterId === 'all') {
          this.clearButton.classList.add('ff-hidden');
        } else {
          this.clearButton.classList.remove('ff-hidden');
        }
      }
      
      // Update active filter
      this.options.activeFilter = filterId;
      
      // Call onChange callback
      if (typeof this.options.onChange === 'function') {
        this.options.onChange(filterId);
      }
      
      // Dispatch custom event
      this.container.dispatchEvent(new CustomEvent('filter:change', {
        bubbles: true,
        detail: {
          filterId: filterId
        }
      }));
    }
    
    /**
     * Reset filters to default state
     */
    reset() {
      this.setActive('all');
    }
    
    /**
     * Add a new filter
     * @param {Object} filter - Filter configuration
     */
    addFilter(filter) {
      if (!filter || !filter.id || !filter.name) return;
      
      // Skip if filter already exists
      if (this.buttons.has(filter.id)) return;
      
      // Add to options
      this.options.filters.push(filter);
      
      // Create button
      const buttonsWrapper = this.filterContainer.querySelector('.ff-filter-buttons');
      if (buttonsWrapper) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ff-filter-btn';
        button.dataset.filterId = filter.id;
        button.textContent = filter.name;
        
        if (filter.icon) {
          button.innerHTML = `<i class="${filter.icon}"></i> ${button.textContent}`;
        }
        
        buttonsWrapper.appendChild(button);
        this.buttons.set(filter.id, button);
        
        // Add click event
        button.addEventListener('click', () => {
          this.setActive(filter.id);
        });
      }
    }
    
    /**
     * Remove a filter
     * @param {string} filterId - ID of the filter to remove
     */
    removeFilter(filterId) {
      // Skip if trying to remove 'all' filter
      if (filterId === 'all') return;
      
      // Get button
      const button = this.buttons.get(filterId);
      if (!button) return;
      
      // Remove from DOM
      button.remove();
      
      // Remove from map
      this.buttons.delete(filterId);
      
      // Remove from options
      this.options.filters = this.options.filters.filter(f => f.id !== filterId);
      
      // Reset to 'all' if the removed filter was active
      if (this.options.activeFilter === filterId) {
        this.reset();
      }
    }
    
    /**
     * Update filter counts
     * @param {Object} counts - Object mapping filter IDs to counts
     */
    updateCounts(counts = {}) {
      Object.entries(counts).forEach(([filterId, count]) => {
        const button = this.buttons.get(filterId);
        if (button) {
          // Check if count badge already exists
          let badge = button.querySelector('.ff-filter-count');
          
          if (!badge) {
            // Create badge if it doesn't exist
            badge = document.createElement('span');
            badge.className = 'ff-filter-count';
            button.appendChild(badge);
          }
          
          badge.textContent = count;
        }
      });
    }
  }