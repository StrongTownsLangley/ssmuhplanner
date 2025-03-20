/**
 * SSMUH Planner - Structures Core Module
 * 
 * This module handles the basic functionality for managing structures.
 */

// Module-level variables
let structureModal;

// Initialize the structures namespace
window.ssmuhStructures = window.ssmuhStructures || {
  structures: [],
  currentStructureId: 0
};

/**
 * Initialize the structures module
 */
function initializeStructuresModule() {
  // Initialize the structure modal if it exists
  if (typeof bootstrap !== 'undefined' && document.getElementById('structureModal')) {
    structureModal = new bootstrap.Modal(document.getElementById('structureModal'));
  }
  
  // Initialize button listeners
  setupStructureListeners();
}

/**
 * Set up structure button listeners
 * This function can be called any time the DOM changes
 */
function setupStructureListeners() {
  // Add event listeners
  const addStructureBtn = document.getElementById('addStructure');
  if (addStructureBtn && !addStructureBtn.hasAttribute('data-initialized')) {
    addStructureBtn.addEventListener('click', showAddStructureModal);
    addStructureBtn.setAttribute('data-initialized', 'true');
  }
  
  // Save structure button
  const saveStructureBtn = document.getElementById('saveStructure');
  if (saveStructureBtn && !saveStructureBtn.hasAttribute('data-initialized')) {
    saveStructureBtn.addEventListener('click', saveStructure);
    saveStructureBtn.setAttribute('data-initialized', 'true');
  }
  
  // Structure type change event
  const structureTypeSelect = document.getElementById('structureType');
  if (structureTypeSelect && !structureTypeSelect.hasAttribute('data-initialized')) {
    structureTypeSelect.addEventListener('change', onStructureTypeChange);
    structureTypeSelect.setAttribute('data-initialized', 'true');
  }
  
  // Structure stories change event
  const structureStoriesSelect = document.getElementById('structureStories');
  if (structureStoriesSelect && !structureStoriesSelect.hasAttribute('data-initialized')) {
    structureStoriesSelect.addEventListener('change', onStructureStoriesChange);
    structureStoriesSelect.setAttribute('data-initialized', 'true');
  }
}

/**
 * Show the add structure modal
 */
function showAddStructureModal() {
  // Reset form
  const structureForm = document.getElementById('structureForm');
  if (structureForm) {
    structureForm.reset();
  }
  
  // Reset help text
  const structureTypeHelp = document.getElementById('structureTypeHelp');
  if (structureTypeHelp) {
    structureTypeHelp.innerHTML = '';
  }
  
  const storiesHelp = document.getElementById('storiesHelp');
  if (storiesHelp) {
    storiesHelp.innerHTML = '';
  }
  
  // Set edit mode to add
  const editModeInput = document.getElementById('editMode');
  if (editModeInput) {
    editModeInput.value = 'add';
  }
  
  // Change save button text
  const saveStructureBtn = document.getElementById('saveStructure');
  if (saveStructureBtn) {
    saveStructureBtn.textContent = 'Add';
  }
  
  // Show modal
  if (structureModal) {
    structureModal.show();
  }
}

/**
 * Capitalize the first letter of a string
 * 
 * @param {string} str The string to capitalize
 * @return {string} The capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get color for structure type
 * 
 * @param {string} type The structure type
 * @return {string} The color for the structure type
 */
function getStructureColor(type) {
  switch(type) {
    case 'principal': return '#007bff';
    case 'secondary': return '#6610f2';
    case 'multiplex': return '#6f42c1';
    case 'accessoryDwellingUnit': return '#e83e8c';
    case 'coach': return '#dc3545';
    case 'garage': return '#fd7e14';
    default: return '#6c757d';
  }
}

// Add these functions to the ssmuhStructures namespace
window.ssmuhStructures.getStructureColor = getStructureColor;
window.ssmuhStructures.capitalize = capitalize;

// Make functions available globally
window.setupStructureListeners = setupStructureListeners;
window.showAddStructureModal = showAddStructureModal;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeStructuresModule);