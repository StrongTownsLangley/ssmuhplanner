/**
 * SSMUH Planner - Structure Form Handlers
 * 
 * This module handles the form-related functionality for adding and editing structures.
 */

/**
 * Handle structure type change event
 */
function onStructureTypeChange() {
  const type = this.value;
  const helpText = document.getElementById('structureTypeHelp');
  
  if (!helpText) return;
  
  if (type === 'secondary') {    
    document.getElementById('structureUnits').value = 2;
  }

  if (type === 'multiplex') {    
    document.getElementById('structureUnits').value = 3;
  }

  if (type === 'garage' || type == 'other' ) {    
    document.getElementById('structureUnits').value = 0;
  }

  // Display structure type information from the bylaw
  if (type in ssmuhRules.buildingTypes) {
    const structureInfo = ssmuhRules.buildingTypes[type];
    helpText.innerHTML = structureInfo.definition || '';
    
    // Add additional information if available
    if (structureInfo.secondarySuiteAllowed) {
      helpText.innerHTML += `<br>Secondary suite allowed: ${structureInfo.secondarySuiteAllowed === true ? 'Yes' : 'No'}`;
      if (structureInfo.secondarySuiteMax) {
        helpText.innerHTML += ` (${structureInfo.secondarySuiteMax})`;
      }
    }
    
    if (type === 'accessoryDwellingUnit' && structureInfo.allowedWhen) {
      helpText.innerHTML += `<br>Note: ${structureInfo.allowedWhen}`;
    }

  } else if (type === 'garage') {
    helpText.innerHTML = 'A detached garage for vehicle parking.';
  } else if (type === 'other') {
    helpText.innerHTML = 'Any other non-dwelling structure on the lot.';
  } else {
    helpText.innerHTML = '';
  }
}

/**
 * Handle structure stories change event
 */
function onStructureStoriesChange() {
  const stories = parseInt(this.value);
  const helpText = document.getElementById('storiesHelp');
  const structureTypeSelect = document.getElementById('structureType');
  
  if (!helpText || !structureTypeSelect) return;
  
  const structureType = structureTypeSelect.value;
  const appState = window.ssmuhPlanner.appState;
  
  if (stories === 3) {
    // Check third storey restrictions based on zone
    if (appState.zoneType === 'R-CL' || appState.zoneType === 'R-CLA' || appState.zoneType === 'R-CLB' || appState.zoneType === 'R-CLCH') {
      // Compact lot zones
      if (appState.zoneInfo && appState.zoneInfo.thirdStoreyRestrictions) {
        if (appState.totalUnits <= 2) {
          helpText.innerHTML = `${appState.zoneInfo.thirdStoreyRestrictions.oneOrTwoDwellingUnits}`;
        } else {
          helpText.innerHTML = `${appState.zoneInfo.thirdStoreyRestrictions.threeOrFourDwellingUnits}`;
        }
      } else {
        if (appState.totalUnits <= 2) {
          helpText.innerHTML = 'Third storey limited to 50% of first storey floor area';
        } else {
          helpText.innerHTML = 'Third storey limited to 80% of first storey floor area';
        }
      }
    } else {
      // Standard zones
      const thirdStoreyRestrictions = ssmuhRules.thirdStoreyRestrictions;
      
      // Calculate current units (excluding new structure)
      const currentUnits = appState.totalUnits;
      
      if (currentUnits <= 2) {
        helpText.innerHTML = `<span class="text-danger">Warning: ${thirdStoreyRestrictions.oneOrTwoDwellingUnits.note}</span>`;
      } else if (currentUnits === 3) {
        const maxArea = thirdStoreyRestrictions.threeDwellingUnits.maxFloorArea;
        helpText.innerHTML = `Third storey limited to ${maxArea}% of first storey floor area`;
      } else {
        const maxArea = thirdStoreyRestrictions.fourDwellingUnits.maxFloorArea;
        helpText.innerHTML = `Third storey limited to ${maxArea}% of first storey floor area`;
      }
    }
  } else {
    helpText.innerHTML = '';
  }
  
  console.log("onStructureStoriesChange");
  console.log(structureType);
  console.log(appState);
  // Special height restrictions for infill housing
  if (structureType === 'accessoryDwellingUnit' && appState.isInfillPresent && appState.loadingType === 'front') {
    const infillMaxHeight = ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight;
    const applicability = ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.applicability;
    console.log("stories " + stories);
    if (stories > 1) {
      helpText.innerHTML += `<br><span class="text-warning">Note: When qualifying for infill housing with an existing dwelling unit, Accessory Units ${applicability} are limited to ${infillMaxHeight}m height (approx. 1 storey)</span>`;
    }
  }
}

/**
 * Save a structure from the modal form
 */
function saveStructure() {
  const appState = window.ssmuhPlanner.appState;
  const structures = window.ssmuhStructures.structures;
  
  // Get form values
  const structureTypeSelect = document.getElementById('structureType');
  const structureWidthInput = document.getElementById('structureWidth');
  const structureDepthInput = document.getElementById('structureDepth');
  const structureStoriesSelect = document.getElementById('structureStories');
  const structureUnitsInput = document.getElementById('structureUnits');
  const structureIdInput = document.getElementById('structureId');
  const editModeInput = document.getElementById('editMode');
  
  if (!structureTypeSelect || !structureWidthInput || !structureDepthInput || 
      !structureStoriesSelect || !structureUnitsInput) {
    console.error('Missing form elements');
    return;
  }
  
  const type = structureTypeSelect.value;
  const width = parseFloat(structureWidthInput.value) || 0;
  const depth = parseFloat(structureDepthInput.value) || 0;
  const stories = parseInt(structureStoriesSelect.value) || 1;
  const units = parseInt(structureUnitsInput.value) || 1;
  const editMode = editModeInput ? editModeInput.value : 'add';
  const structureId = structureIdInput ? parseInt(structureIdInput.value) : -1;
  
  // Validate inputs
  if (width <= 0 || depth <= 0) {
    alert('Please enter valid dimensions');
    return;
  }
  
  // Check if structure fits on lot
  if (width > appState.lotWidth || depth > appState.lotDepth) {
    alert('Structure dimensions exceed lot size');
    return;
  }
  
  // Check height restrictions based on structure type and stories
  let maxHeightAllowed = ssmuhRules.heightRestrictions.allOtherDwellingUnits.maxHeight;
  
  // Apply specific restrictions for infill housing near rear lot line
  if (type === 'infill' && appState.loadingType === 'front') {
    const infillMaxHeight = ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight;
    const applicability = ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.applicability;
    const distanceFromRear = 6; // metres, from applicability text
    
    if (stories > 1 && appState.lotDepth - (depth + distanceFromRear) < 0) {
      alert(`Infill housing ${applicability} is limited to ${infillMaxHeight} metres (approximately 1 storey)`);
      return;
    }
  }
  
  // Check accessory building height restrictions
  if (type === 'garage' || (type === 'other' && units === 0)) {
    maxHeightAllowed = ssmuhRules.heightRestrictions.accessoryNonDwellingStructures.maxHeight;
    if (stories > 1) {
      alert(`Accessory non-dwelling structures are limited to ${maxHeightAllowed} metres (approximately 1 storey)`);
      return;
    }
  }
  
  // Validate unit count for new structure or when updating
  if (units > 0) {
    let existingUnits = 0;
    
    if (editMode === 'edit' && structureId >= 0) {
      // For edit mode, exclude the current structure's units from the count
      existingUnits = structures.reduce((sum, s) => s.id !== structureId ? sum + s.units : sum, 0);
    } else {
      // For add mode, include all existing structures
      existingUnits = structures.reduce((sum, s) => sum + s.units, 0);
    }
    
    if (existingUnits + units > appState.maxUnits) {
      alert(`This would exceed the maximum of ${appState.maxUnits} units allowed on this lot`);
      return;
    }
  }
  
  // Check third storey restrictions
  if (stories === 3) {
    // Get appropriate third storey restriction based on zone
    let isThirdStoreyAllowed = true;
    let thirdStoreyMessage = '';
    
    if (appState.zoneType === 'R-CL' || appState.zoneType === 'R-CLA' || appState.zoneType === 'R-CLB' || appState.zoneType === 'R-CLCH') {
      // Compact lot zones have different third storey rules
      // Always allowed with restrictions
    } else {
      // Standard zones
      let totalExistingUnits = 0;
      
      if (editMode === 'edit' && structureId >= 0) {
        // For edit mode, exclude the current structure's units from the count
        totalExistingUnits = structures.reduce((sum, s) => s.id !== structureId ? sum + s.units : sum, 0);
      } else {
        // For add mode, include all existing structures
        totalExistingUnits = structures.reduce((sum, s) => sum + s.units, 0);
      }
      
      if (totalExistingUnits + units <= 2) {
        isThirdStoreyAllowed = false;
        thirdStoreyMessage = 'Third storey is not permitted with 1-2 dwelling units on the lot';
      }
    }
    
    if (!isThirdStoreyAllowed) {
      alert(thirdStoreyMessage);
      return;
    }
  }
  
  if (editMode === 'edit' && structureId >= 0) {
    // Update existing structure
    const existingStructure = structures.find(s => s.id === structureId);
    if (existingStructure) {
      existingStructure.type = type;
      existingStructure.width = width;
      existingStructure.depth = depth;
      existingStructure.stories = stories;
      existingStructure.units = units;
      
      // Check if structure respects setbacks
      const violatesSetbacks = window.checkSetbackViolation(existingStructure);
      
      // Update structure list item
      window.updateStructureListItem(existingStructure, violatesSetbacks);
    }
  } else {
    // Add new structure
    const newStructure = {
      id: window.ssmuhStructures.currentStructureId++,
      type: type,
      width: width,
      depth: depth,
      stories: stories,
      units: units,
      x: (appState.lotWidth - width) / 2, // Center horizontally
      y: (appState.lotDepth - depth) / 2  // Center vertically
    };
    
    structures.push(newStructure);
    
    // Check if structure violates setbacks
    const violatesSetbacks = window.checkSetbackViolation(newStructure);
    
    // Add to structure list
    window.addStructureToList(newStructure, violatesSetbacks);
  }
  
  // Hide modal
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modalElement = document.getElementById('structureModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  }
  
  // Update appState with structures info
  appState.totalUnits = structures.reduce((sum, s) => sum + s.units, 0);
  appState.totalBuildingArea = structures.reduce((sum, s) => sum + (s.width * s.depth), 0);
  appState.isInfillPresent = structures.some(s => s.type === 'infill');
  
  // Update lot canvas
  if (typeof renderLotCanvas === 'function') {
    renderLotCanvas();
  }
  
  // Update stats
  if (typeof updateLotStats === 'function') {
    updateLotStats();
  }
}

// Export functions for use in other modules
window.onStructureTypeChange = onStructureTypeChange;
window.onStructureStoriesChange = onStructureStoriesChange;
window.saveStructure = saveStructure;
