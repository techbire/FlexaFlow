// src/index.js

/**
 * FlexaFlow - A modern UI component library
 * Main entry point
 */

// Import styles
import './styles/variables.css';
import './styles/components.css';
import './styles/utilities.css';
import './styles/animations.css';

// Import all components
import Toast from './components/core/toast';
import Modal from './components/core/modal';
import Dropdown from './components/core/dropdown';
import Tabs from './components/core/tabs';
import Filters from './components/ui/filters';
import Card from './components/ui/cards';
import Form from './components/ui/forms';
import Loader from './components/ui/loaders';

// Create main FlexaFlow object
const FlexaFlow = {
  version: '1.0.0',
  
  // Core components
  Toast,
  Modal,
  Dropdown,
  Tabs,
  
  // UI components
  Filters,
  Card,
  Form,
  Loader,
  
  // Helper for initializing all components on a page
  init(options = {}) {
    // Initialize default components based on data attributes
    this._initAutoComponents();
    
    // Return the FlexaFlow instance for chaining
    return this;
  },
  
  // Initialize components based on data attributes
  _initAutoComponents() {
    // Initialize toasts
    document.querySelectorAll('[data-ff-toast]').forEach(el => {
      el.addEventListener('click', () => {
        const toast = new Toast();
        const type = el.getAttribute('data-ff-toast-type') || 'info';
        const message = el.getAttribute('data-ff-toast-message') || 'Notification';
        
        toast[type](message);
      });
    });
    
    // Initialize modals
    document.querySelectorAll('[data-ff-modal-trigger]').forEach(trigger => {
      const modalId = trigger.getAttribute('data-ff-modal-trigger');
      const modalElement = document.querySelector(`[data-ff-modal="${modalId}"]`);
      
      if (modalElement) {
        const modal = new Modal();
        const content = modalElement.innerHTML;
        const title = modalElement.getAttribute('data-ff-modal-title') || '';
        
        const modalInstance = modal.create({
          id: modalId,
          title: title,
          content: content,
          showHeader: modalElement.getAttribute('data-ff-modal-header') !== 'false',
          showFooter: modalElement.getAttribute('data-ff-modal-footer') !== 'false'
        });
        
        trigger.addEventListener('click', () => {
          modalInstance.open();
        });
      }
    });
    
    // Initialize dropdowns
    document.querySelectorAll('[data-ff-dropdown]').forEach(el => {
      new Dropdown(el);
    });
    
    // Initialize tabs
    document.querySelectorAll('[data-ff-tabs]').forEach(el => {
      new Tabs(el);
    });
    
    // Initialize filters
    document.querySelectorAll('[data-ff-filters]').forEach(el => {
      new Filters(el);
    });
    
    // Initialize forms with validation
    document.querySelectorAll('form[data-ff-validate]').forEach(el => {
      new Form(el, {
        validation: true
      });
    });
  }
};

// Export both the default object and named exports
export { 
  Toast, 
  Modal, 
  Dropdown, 
  Tabs, 
  Filters, 
  Card, 
  Form, 
  Loader 
};

export default FlexaFlow;