/**
 * FlexaFlow Tabs Component
 * An accessible, customizable tab system
 */
export default class FlexaTabs {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
        
      if (!this.container) {
        console.error('FlexaTabs: Container element not found');
        return;
      }
      
      this.options = {
        activeTab: options.activeTab || null,
        animation: options.animation !== false,
        animationDuration: options.animationDuration || 200,
        onChange: options.onChange || null,
        storage: options.storage || false,
        storageKey: options.storageKey || 'flexaflow-active-tab',
        vertical: options.vertical || false,
        classes: options.classes || {}
      };
      
      this.tabs = [];
      this.activeTabId = null;
      
      this._init();
    }
    
    /**
     * Initialize tabs component
     * @private
     */
    _init() {
      // Find tab navigation and content elements
      this.tabList = this.container.querySelector('[role="tablist"]');
      if (!this.tabList) {
        console.error('FlexaTabs: No tablist element found with [role="tablist"]');
        return;
      }
      
      // Find all tab items
      const tabItems = this.tabList.querySelectorAll('[role="tab"]');
      if (!tabItems || tabItems.length === 0) {
        console.error('FlexaTabs: No tab elements found with [role="tab"]');
        return;
      }
      
      // Initialize tabs data
      tabItems.forEach(tabEl => {
        const tabId = tabEl.getAttribute('id');
        if (!tabId) {
          console.error('FlexaTabs: Tab element must have an ID attribute');
          return;
        }
        
        const tabPanelId = tabEl.getAttribute('aria-controls');
        if (!tabPanelId) {
          console.error(`FlexaTabs: Tab with ID "${tabId}" must have an aria-controls attribute`);
          return;
        }
        
        const tabPanel = document.getElementById(tabPanelId);
        if (!tabPanel) {
          console.error(`FlexaTabs: Tab panel with ID "${tabPanelId}" not found`);
          return;
        }
        
        // Store tab data
        this.tabs.push({
          id: tabId,
          panelId: tabPanelId,
          tabElement: tabEl,
          panelElement: tabPanel
        });
        
        // Add click event listener
        tabEl.addEventListener('click', (e) => {
          e.preventDefault();
          this.activate(tabId);
        });
        
        // Add keyboard navigation
        tabEl.addEventListener('keydown', (e) => {
          this._handleKeyDown(e, tabId);
        });
      });
      
      // Initialize active tab
      let initialTabId = null;
      
      // Check local storage if enabled
      if (this.options.storage) {
        const savedTabId = localStorage.getItem(this.options.storageKey);
        if (savedTabId && this.tabs.some(tab => tab.id === savedTabId)) {
          initialTabId = savedTabId;
        }
      }
      
      // Use option or first tab as fallback
      if (!initialTabId) {
        initialTabId = this.options.activeTab || (this.tabs[0] && this.tabs[0].id);
      }
      
      if (initialTabId) {
        this.activate(initialTabId, false); // No animation on initial load
      }
      
      // Add appropriate classes if vertical
      if (this.options.vertical && this.tabList) {
        this.tabList.classList.add('ff-flex-col');
      }
    }
    
    /**
     * Handle keyboard navigation
     * @private
     * @param {Event} e - Keyboard event
     * @param {string} currentTabId - Current tab ID
     */
    _handleKeyDown(e, currentTabId) {
      // Find current tab index
      const currentIndex = this.tabs.findIndex(tab => tab.id === currentTabId);
      if (currentIndex === -1) return;
      
      let nextIndex = null;
      
      if (this.options.vertical) {
        // Vertical tabs
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % this.tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          nextIndex = this.tabs.length - 1;
        }
      } else {
        // Horizontal tabs
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % this.tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          nextIndex = this.tabs.length - 1;
        }
      }
      
      if (nextIndex !== null) {
        const nextTabId = this.tabs[nextIndex].id;
        this.activate(nextTabId);
        
        // Focus on the tab element
        this.tabs[nextIndex].tabElement.focus();
      }
    }
    
    /**
     * Activate a specific tab
     * @param {string} tabId - ID of the tab to activate
     * @param {boolean} animate - Whether to animate the transition
     */
    activate(tabId, animate = true) {
      const tab = this.tabs.find(t => t.id === tabId);
      if (!tab) return;
      
      // Skip if already active
      if (this.activeTabId === tabId) return;
      
      // Find previous active tab
      let prevTab = null;
      if (this.activeTabId) {
        prevTab = this.tabs.find(t => t.id === this.activeTabId);
      }
      
      // Update aria attributes
      this.tabs.forEach(t => {
        t.tabElement.setAttribute('aria-selected', t.id === tabId ? 'true' : 'false');
        t.tabElement.tabIndex = t.id === tabId ? 0 : -1;
        
        // Add/remove active classes
        if (this.options.classes.active) {
          if (t.id === tabId) {
            t.tabElement.classList.add(...this.options.classes.active.split(' '));
          } else {
            t.tabElement.classList.remove(...this.options.classes.active.split(' '));
          }
        }
      });
      
      // Disable animation if requested
      const shouldAnimate = animate && this.options.animation;
      
      // Hide previous panel with animation
      if (prevTab && shouldAnimate) {
        const prevPanel = prevTab.panelElement;
        
        // Add transition
        prevPanel.style.transition = `opacity ${this.options.animationDuration}ms ease-out`;
        prevPanel.style.opacity = '0';
        
        setTimeout(() => {
          prevPanel.hidden = true;
          prevPanel.style.opacity = '';
        }, this.options.animationDuration);
      } else if (prevTab) {
        // Hide without animation
        prevTab.panelElement.hidden = true;
      }
      
      // Show new panel
      if (shouldAnimate) {
        tab.panelElement.style.transition = `opacity ${this.options.animationDuration}ms ease-in`;
        tab.panelElement.style.opacity = '0';
        tab.panelElement.hidden = false;
        
        // Trigger reflow
        tab.panelElement.offsetHeight;
        
        // Show with animation
        tab.panelElement.style.opacity = '1';
        
        setTimeout(() => {
          tab.panelElement.style.opacity = '';
        }, this.options.animationDuration);
      } else {
        tab.panelElement.hidden = false;
      }
      
      // Update active tab
      this.activeTabId = tabId;
      
      // Save to storage if enabled
      if (this.options.storage) {
        localStorage.setItem(this.options.storageKey, tabId);
      }
      
      // Trigger onChange callback
      if (this.options.onChange && typeof this.options.onChange === 'function') {
        this.options.onChange(tabId, tab);
      }
      
      // Dispatch custom event
      this._triggerEvent('change', { tabId, tab });
    }
    
    /**
     * Get the active tab
     * @returns {Object|null} - Active tab data
     */
    getActive() {
      if (!this.activeTabId) return null;
      
      return this.tabs.find(tab => tab.id === this.activeTabId);
    }
    
    /**
     * Trigger custom event
     * @private
     * @param {string} eventName - Event name
     * @param {Object} detail - Event details
     */
    _triggerEvent(eventName, detail) {
      const event = new CustomEvent(`flexatabs:${eventName}`, {
        bubbles: true,
        detail: {
          tabs: this,
          ...detail
        }
      });
      
      this.container.dispatchEvent(event);
    }
    
    /**
     * Refresh tabs if DOM has changed
     */
    refresh() {
      // Store active tab ID
      const activeTabId = this.activeTabId;
      
      // Reset tabs
      this.tabs = [];
      
      // Re-initialize
      this._init();
      
      // Restore active tab if it still exists
      if (activeTabId && this.tabs.some(tab => tab.id === activeTabId)) {
        this.activate(activeTabId, false);
      }
    }
    
    /**
     * Destroy the tabs component and clean up
     */
    destroy() {
      // Remove event listeners (can't easily remove the bound listeners)
      
      // Remove classes and attributes
      this.tabs.forEach(tab => {
        tab.tabElement.removeAttribute('aria-selected');
        tab.tabElement.removeAttribute('tabindex');
        
        if (this.options.classes.active) {
          tab.tabElement.classList.remove(...this.options.classes.active.split(' '));
        }
        
        // Show all panels
        tab.panelElement.hidden = false;
      });
      
      // Clear local storage if enabled
      if (this.options.storage) {
        localStorage.removeItem(this.options.storageKey);
      }
    }
  }