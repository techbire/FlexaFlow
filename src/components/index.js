import Toast from './core/toast';
import Modal from './core/modal';
import Dropdown from './core/dropdown';
import Tabs from './core/tabs';

// UI components
import Filters from './ui/filters';
import Card from './ui/cards';
import Form from './ui/forms';
import Loader from './ui/loaders';

// Export individual components
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

// Export grouped by category
export const Core = {
  Toast,
  Modal,
  Dropdown,
  Tabs
};

export const UI = {
  Filters,
  Card,
  Form,
  Loader
};

// Default export with all components
export default {
  Toast,
  Modal,
  Dropdown,
  Tabs,
  Filters,
  Card,
  Form,
  Loader
};