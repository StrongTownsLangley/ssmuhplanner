/**
 * SSMUH Planner - Main Application JavaScript
 * 
 * This file contains the core functionality and initialization for the SSMUH Planning Tool.
 */

// Global variables for application state
let appState = {
  lotWidth: 0,
  lotDepth: 0,
  lotAreaM2: 0,
  maxUnits: 0,
  totalUnits: 0,
  totalBuildingArea: 0,
  isInfillPresent: false,
  zoneType: 'R1A',
  loadingType: 'front',
  isCornerLot: false,
  isArterialRoad: false,
  setbacks: {},
  zoneInfo: {}
};

// Global variables for DOM elements
const domElements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM element references
  initializeDomElements();
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize UI components with direct PHP includes
  renderEligibilitySection();
  initializeStructureModal();
  
  console.log('SSMUH Planner initialized');
});

/**
 * Initialize references to DOM elements
 */
function initializeDomElements() {
  // Eligibility check section
  domElements.eligibilitySection = document.getElementById('eligibility-section');
  
  // Lot builder section
  domElements.lotBuilderSection = document.getElementById('lot-builder-section');
  
  // Zone info section
  domElements.zoneInfoSection = document.getElementById('zone-info-section');
  
  // Structure modal
  domElements.structureModal = document.getElementById('structureModal');
  domElements.structureForm = document.getElementById('structureForm');
  domElements.structureType = document.getElementById('structureType');
  domElements.structureTypeHelp = document.getElementById('structureTypeHelp');
  domElements.structureWidth = document.getElementById('structureWidth');
  domElements.structureDepth = document.getElementById('structureDepth');
  domElements.structureStories = document.getElementById('structureStories');
  domElements.storiesHelp = document.getElementById('storiesHelp');
  domElements.structureUnits = document.getElementById('structureUnits');
  domElements.structureId = document.getElementById('structureId');
  domElements.editMode = document.getElementById('editMode');
  domElements.saveStructure = document.getElementById('saveStructure');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Zone type change
  if (document.getElementById('zoneType')) {
    document.getElementById('zoneType').addEventListener('change', function() {
      const zoneType = this.value;
      const helpText = document.getElementById('zoneHelp');
      
      // Display zone information from the bylaw
      if (zoneType === 'R1A' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
        const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1A;
        helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
      } else if (zoneType.startsWith('R1') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
        const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1B_R1C_R1D_R1E;
        helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
      } else if (zoneType === 'R2' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
        const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R2;
        helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
      } else if (zoneType === 'R-CL' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
        const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R_CL;
        helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
      } else if (zoneType.startsWith('SR') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.suburbanResidential) {
        const zoneInfo = ssmuhRules.zoningAreas.suburbanResidential[zoneType];
        if (zoneInfo) {
          helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
        } else {
          helpText.innerHTML = 'Zone information not available.';
        }
      } else if (zoneType === 'CD' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.comprehensiveDevelopmentZones) {
        helpText.innerHTML = 'CD zones may allow SSMUH. Please check specific CD zone number against allowed zones list.';
      } else {
        helpText.innerHTML = '';
      }
    });
  }
}

/**
 * Renders the eligibility section
 */
function renderEligibilitySection() {
  // With direct PHP includes, we don't need to render templates
  // Just add event listeners to the pre-loaded content
  
  const checkEligibilityBtn = document.getElementById('checkEligibility');
  if (checkEligibilityBtn) {
    checkEligibilityBtn.addEventListener('click', checkEligibility);
  }

  const zoneTypeSelect = document.getElementById('zoneType');
  if (zoneTypeSelect) {
    zoneTypeSelect.addEventListener('change', onZoneTypeChange);
  }
}

/**
 * Initialize the structure modal
 */
function initializeStructureModal() {
  if (domElements.structureType) {
    domElements.structureType.addEventListener('change', onStructureTypeChange);
  }
  
  if (domElements.structureStories) {
    domElements.structureStories.addEventListener('change', onStructureStoriesChange);
  }
  
  if (domElements.saveStructure) {
    domElements.saveStructure.addEventListener('click', saveStructure);
  }
  
  // Initialize Bootstrap modal if available
  if (typeof bootstrap !== 'undefined' && domElements.structureModal) {
    const modal = new bootstrap.Modal(domElements.structureModal);
    appState.structureModal = modal;
  }
}

/**
 * Handler for zone type change event
 */
function onZoneTypeChange() {
  const zoneType = this.value;
  
  // Call the updateZoneHelp function passing the zone type as parameter
  window.updateZoneHelp(zoneType);
}

/**
 * Update zone help text based on zone type
 * 
 * @param {string} zoneType The zone type
 * @param {HTMLElement} helpText The help text element
 */
function updateZoneHelp(zoneType, helpText) {
  if (!helpText) return;
  
  if (zoneType === 'R1A' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1A;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType.startsWith('R1') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1B_R1C_R1D_R1E;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType === 'R2' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R2;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType === 'R-CL' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    const zoneInfo = ssmuhRules.zoningAreas.residentialZones.R_CL;
    helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
  } else if (zoneType.startsWith('SR') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.suburbanResidential) {
    const zoneInfo = ssmuhRules.zoningAreas.suburbanResidential[zoneType];
    if (zoneInfo) {
      helpText.innerHTML = zoneInfo.allowsSSMUH ? 'SSMUH is allowed in this zone.' : 'SSMUH is not allowed in this zone.';
    } else {
      helpText.innerHTML = 'Zone information not available.';
    }
  } else if (zoneType === 'CD' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.comprehensiveDevelopmentZones) {
    helpText.innerHTML = 'CD zones may allow SSMUH. Please check specific CD zone number against allowed zones list.';
  } else {
    helpText.innerHTML = '';
  }
}

// Export shared functions and variables for use in other modules
window.ssmuhPlanner = {
  appState: appState,
  domElements: domElements,
  updateZoneHelp: updateZoneHelp
};
