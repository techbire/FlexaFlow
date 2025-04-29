// src/components/ui/cards.js

/**
 * FlexaFlow Cards Component
 * A versatile card component system for displaying content
 */
export default class FlexaCards {
    /**
     * Create a new card component
     * @param {Object} options - Card configuration options
     */
    constructor(options = {}) {
      this.options = {
        shadow: options.shadow || 'md',
        hover: options.hover !== false,
        rounded: options.rounded || 'md',
        padding: options.padding || 'md',
        transition: options.transition !== false,
        theme: options.theme || 'light',
        class: options.class || ''
      };
    }
    
    /**
     * Create a basic card
     * @param {Object} content - Card content
     * @returns {HTMLElement} - Card element
     */
    createBasicCard(content = {}) {
      const card = document.createElement('div');
      card.className = this._getBaseClasses();
      
      card.innerHTML = `
        ${content.header ? `<div class="ff-card-header">${content.header}</div>` : ''}
        <div class="ff-card-body">${content.body || ''}</div>
        ${content.footer ? `<div class="ff-card-footer">${content.footer}</div>` : ''}
      `;
      
      return card;
    }
    
    /**
     * Create a media card with image
     * @param {Object} content - Card content including image
     * @returns {HTMLElement} - Card element
     */
    createMediaCard(content = {}) {
      const card = document.createElement('div');
      card.className = this._getBaseClasses();
      
      const imagePosition = content.imagePosition || 'top';
      
      if (imagePosition === 'top' && content.image) {
        card.innerHTML = `
          <div class="ff-card-media">
            <img src="${content.image}" alt="${content.imageAlt || ''}" class="ff-card-img">
          </div>
          ${content.header ? `<div class="ff-card-header">${content.header}</div>` : ''}
          <div class="ff-card-body">${content.body || ''}</div>
          ${content.footer ? `<div class="ff-card-footer">${content.footer}</div>` : ''}
        `;
      } else if (imagePosition === 'side' && content.image) {
        card.className += ' ff-card-horizontal';
        card.innerHTML = `
          <div class="ff-card-media-side">
            <img src="${content.image}" alt="${content.imageAlt || ''}" class="ff-card-img-side">
          </div>
          <div class="ff-card-content">
            ${content.header ? `<div class="ff-card-header">${content.header}</div>` : ''}
            <div class="ff-card-body">${content.body || ''}</div>
            ${content.footer ? `<div class="ff-card-footer">${content.footer}</div>` : ''}
          </div>
        `;
      } else {
        // Fallback to basic card if no image
        return this.createBasicCard(content);
      }
      
      return card;
    }
    
    /**
     * Create an interactive card with hover effects and click handler
     * @param {Object} content - Card content
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} - Card element
     */
    createInteractiveCard(content = {}, onClick) {
      const card = this.createMediaCard(content);
      card.classList.add('ff-card-interactive');
      
      if (typeof onClick === 'function') {
        card.addEventListener('click', onClick);
      }
      
      return card;
    }
    
    /**
     * Create a card with custom actions
     * @param {Object} content - Card content
     * @param {Array} actions - Array of action buttons
     * @returns {HTMLElement} - Card element
     */
    createActionCard(content = {}, actions = []) {
      const card = this.createMediaCard(content);
      
      if (actions.length > 0) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'ff-card-actions';
        
        actions.forEach(action => {
          const button = document.createElement('button');
          button.className = `ff-btn ff-btn-${action.type || 'default'}`;
          button.textContent = action.text || 'Action';
          
          if (action.icon) {
            button.innerHTML = `<i class="${action.icon}"></i> ${button.textContent}`;
          }
          
          if (typeof action.onClick === 'function') {
            button.addEventListener('click', (e) => {
              e.stopPropagation();
              action.onClick(e);
            });
          }
          
          actionsContainer.appendChild(button);
        });
        
        card.appendChild(actionsContainer);
      }
      
      return card;
    }
    
    /**
     * Get base CSS classes for cards
     * @private
     * @returns {string} - CSS class string
     */
    _getBaseClasses() {
      const shadowClasses = {
        'none': '',
        'sm': 'ff-shadow-sm',
        'md': 'ff-shadow',
        'lg': 'ff-shadow-lg',
        'xl': 'ff-shadow-xl'
      };
      
      const roundedClasses = {
        'none': 'ff-rounded-none',
        'sm': 'ff-rounded-sm',
        'md': 'ff-rounded',
        'lg': 'ff-rounded-lg',
        'xl': 'ff-rounded-xl',
        'full': 'ff-rounded-full'
      };
      
      const paddingClasses = {
        'none': 'ff-p-0',
        'sm': 'ff-p-2',
        'md': 'ff-p-4',
        'lg': 'ff-p-6',
        'xl': 'ff-p-8'
      };
      
      const themeClasses = {
        'light': 'ff-bg-white ff-text-gray-800',
        'dark': 'ff-bg-gray-800 ff-text-white',
        'primary': 'ff-bg-blue-600 ff-text-white',
        'secondary': 'ff-bg-gray-600 ff-text-white',
        'success': 'ff-bg-green-500 ff-text-white',
        'danger': 'ff-bg-red-500 ff-text-white',
        'warning': 'ff-bg-yellow-500 ff-text-white',
        'info': 'ff-bg-blue-400 ff-text-white'
      };
      
      let classes = 'ff-card';
      
      // Add shadow
      if (shadowClasses[this.options.shadow]) {
        classes += ` ${shadowClasses[this.options.shadow]}`;
      }
      
      // Add rounded corners
      if (roundedClasses[this.options.rounded]) {
        classes += ` ${roundedClasses[this.options.rounded]}`;
      }
      
      // Add padding
      if (paddingClasses[this.options.padding]) {
        classes += ` ${paddingClasses[this.options.padding]}`;
      }
      
      // Add theme
      if (themeClasses[this.options.theme]) {
        classes += ` ${themeClasses[this.options.theme]}`;
      }
      
      // Add hover effect
      if (this.options.hover) {
        classes += ' ff-hover';
      }
      
      // Add transition
      if (this.options.transition) {
        classes += ' ff-transition';
      }
      
      // Add custom class
      if (this.options.class) {
        classes += ` ${this.options.class}`;
      }
      
      return classes;
    }
    
    /**
     * Create a card grid
     * @param {Array} cards - Array of card elements
     * @param {Object} options - Grid options
     * @returns {HTMLElement} - Grid container
     */
    createGrid(cards = [], options = {}) {
      const container = document.createElement('div');
      container.className = 'ff-card-grid';
      
      // Add grid columns based on options
      if (options.columns) {
        container.style.gridTemplateColumns = `repeat(${options.columns}, 1fr)`;
      }
      
      // Add gap
      if (options.gap) {
        container.style.gap = options.gap;
      }
      
      // Add cards to grid
      cards.forEach(card => {
        container.appendChild(card);
      });
      
      return container;
    }
    
    /**
     * Create a masonry layout
     * @param {Array} cards - Array of card elements
     * @param {Object} options - Masonry options
     * @returns {HTMLElement} - Masonry container
     */
    createMasonry(cards = [], options = {}) {
      const container = document.createElement('div');
      container.className = 'ff-masonry';
      
      // Create columns
      const columnCount = options.columns || 3;
      const columns = [];
      
      for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'ff-masonry-column';
        columns.push(column);
        container.appendChild(column);
      }
      
      // Distribute cards among columns
      cards.forEach((card, index) => {
        const columnIndex = index % columnCount;
        columns[columnIndex].appendChild(card);
      });
      
      return container;
    }
  }