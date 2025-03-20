/**
 * SSMUH Planner - Structure List Management
 * 
 * This module handles the structure list UI functionality.
 */

/**
 * Add a structure to the structures list
 * 
 * @param {object} structure The structure to add
 * @param {boolean} violatesSetbacks Whether the structure violates setbacks
 */
function addStructureToList(structure, violatesSetbacks) {
  const structuresList = document.getElementById('structuresList');
  if (!structuresList) return;
  
  // Create structure card
  const structureItem = document.createElement('div');
  structureItem.className = violatesSetbacks ? 'card mb-2 border-danger' : 'card mb-2';
  
  // Determine height description
  const appState = window.ssmuhPlanner.appState;
  let heightEstimate;
  
  if (structure.type === 'garage' || (structure.type === 'other' && structure.units === 0)) {
    heightEstimate = `${ssmuhRules.heightRestrictions.accessoryNonDwellingStructures.maxHeight}m max`;
  } else if (structure.type === 'infill' && appState.loadingType === 'front' && 
            appState.lotDepth - (structure.y + structure.depth) < 6) {
    // Infill near rear lot line
    heightEstimate = `${ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight}m max`;
  } else {
    heightEstimate = `${structure.stories} ${structure.stories > 1 ? 'stories' : 'story'} (${structure.stories * 3}m est.)`;
  }
  
  // Set card content
  structureItem.innerHTML = `
    <div class="card-body p-2">
      <h5 class="card-title">${window.ssmuhStructures.capitalize(structure.type)} ${structure.units > 0 ? '- ' + structure.units + ' unit(s)' : ''}</h5>
      <p class="card-text">
        Size: ${structure.width}m × ${structure.depth}m (${(structure.width * structure.depth).toFixed(1)} m²)<br>
        Height: ${heightEstimate}<br>
        Position: ${structure.x.toFixed(1)}m from left, ${structure.y.toFixed(1)}m from top
      </p>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-danger remove-structure" data-id="${structure.id}">Remove</button>
        <button type="button" class="btn btn-sm btn-secondary edit-structure" data-id="${structure.id}">Edit</button>
      </div>
      ${violatesSetbacks ? '<div class="setback-warning text-danger small mt-1"><i class="bi bi-exclamation-triangle-fill"></i> Violates setback requirements</div>' : ''}
    </div>
  `;
  
  // Add event listeners
  const removeBtn = structureItem.querySelector('.remove-structure');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      const structureId = parseInt(this.getAttribute('data-id'));
      removeStructure(structureId, structureItem);
    });
  }
  
  const editBtn = structureItem.querySelector('.edit-structure');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      const structureId = parseInt(this.getAttribute('data-id'));
      editStructure(structureId);
    });
  }
  
  // Add to list
  structuresList.appendChild(structureItem);
}

/**
 * Update a structure in the structures list
 * 
 * @param {object} structure The structure to update
 * @param {boolean} violatesSetbacks Whether the structure violates setbacks
 */
function updateStructureListItem(structure, violatesSetbacks) {
  const structuresList = document.getElementById('structuresList');
  if (!structuresList) return;
  
  // Find structure item
  const structureItems = structuresList.querySelectorAll('.card');
  for (let i = 0; i < structureItems.length; i++) {
    const item = structureItems[i];
    const removeBtn = item.querySelector('.remove-structure');
    
    if (removeBtn && parseInt(removeBtn.getAttribute('data-id')) === structure.id) {
      // Update card style
      item.className = violatesSetbacks ? 'card mb-2 border-danger' : 'card mb-2';
      
      // Determine height description
      const appState = window.ssmuhPlanner.appState;
      let heightEstimate;
      
      if (structure.type === 'garage' || (structure.type === 'other' && structure.units === 0)) {
        heightEstimate = `${ssmuhRules.heightRestrictions.accessoryNonDwellingStructures.maxHeight}m max`;
      } else if (structure.type === 'infill' && appState.loadingType === 'front' && 
                appState.lotDepth - (structure.y + structure.depth) < 6) {
        // Infill near rear lot line
        heightEstimate = `${ssmuhRules.heightRestrictions.infillHousingNearRearLotLine.maxHeight}m max`;
      } else {
        heightEstimate = `${structure.stories} ${structure.stories > 1 ? 'stories' : 'story'} (${structure.stories * 3}m est.)`;
      }
      
      // Update card content
      const cardTitle = item.querySelector('.card-title');
      if (cardTitle) {
        cardTitle.textContent = `${window.ssmuhStructures.capitalize(structure.type)} ${structure.units > 0 ? '- ' + structure.units + ' unit(s)' : ''}`;
      }
      
      const cardText = item.querySelector('.card-text');
      if (cardText) {
        cardText.innerHTML = `
          Size: ${structure.width}m × ${structure.depth}m (${(structure.width * structure.depth).toFixed(1)} m²)<br>
          Height: ${heightEstimate}<br>
          Position: ${structure.x.toFixed(1)}m from left, ${structure.y.toFixed(1)}m from top
        `;
      }
      
      // Update setback warning
      const existingWarning = item.querySelector('.setback-warning');
      if (existingWarning) {
        existingWarning.remove();
      }
      
      if (violatesSetbacks) {
        const warning = document.createElement('div');
        warning.className = 'setback-warning text-danger small mt-1';
        warning.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Violates setback requirements';
        item.querySelector('.card-body').appendChild(warning);
      }
      
      break;
    }
  }
}

/**
 * Remove a structure
 * 
 * @param {number} structureId The ID of the structure to remove
 * @param {HTMLElement} structureItem The structure item element to remove
 */
function removeStructure(structureId, structureItem) {
  const appState = window.ssmuhPlanner.appState;
  const structures = window.ssmuhStructures.structures;
  
  // Remove from structures array
  window.ssmuhStructures.structures = structures.filter(s => s.id !== structureId);
  
  // Remove from DOM
  const structuresList = document.getElementById('structuresList');
  if (structuresList && structureItem) {
    structuresList.removeChild(structureItem);
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

/**
 * Edit a structure
 * 
 * @param {number} structureId The ID of the structure to edit
 */
function editStructure(structureId) {
  const structures = window.ssmuhStructures.structures;
  const structure = structures.find(s => s.id === structureId);
  if (!structure) return;
  
  // Get form elements
  const structureTypeSelect = document.getElementById('structureType');
  const structureWidthInput = document.getElementById('structureWidth');
  const structureDepthInput = document.getElementById('structureDepth');
  const structureStoriesSelect = document.getElementById('structureStories');
  const structureUnitsInput = document.getElementById('structureUnits');
  const structureIdInput = document.getElementById('structureId');
  const editModeInput = document.getElementById('editMode');
  const saveStructureBtn = document.getElementById('saveStructure');
  
  if (!structureTypeSelect || !structureWidthInput || !structureDepthInput || 
      !structureStoriesSelect || !structureUnitsInput || !structureIdInput || 
      !editModeInput || !saveStructureBtn) {
    console.error('Missing form elements');
    return;
  }
  
  // Populate form with structure data
  structureTypeSelect.value = structure.type;
  structureWidthInput.value = structure.width;
  structureDepthInput.value = structure.depth;
  structureStoriesSelect.value = structure.stories;
  structureUnitsInput.value = structure.units;
  structureIdInput.value = structure.id;
  editModeInput.value = 'edit';
  
  // Trigger change events to update help text
  structureTypeSelect.dispatchEvent(new Event('change'));
  structureStoriesSelect.dispatchEvent(new Event('change'));
  
  // Update save button text
  saveStructureBtn.textContent = 'Update';
  
  // Show modal
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modalElement = document.getElementById('structureModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.show();
    }
  }
}

/**
 * Update a structure position after it's been dragged
 * 
 * @param {number} structureId The ID of the structure
 * @param {number} newX The new X position
 * @param {number} newY The new Y position
 */
function updateStructurePosition(structureId, newX, newY) {
  const structures = window.ssmuhStructures.structures;
  const structure = structures.find(s => s.id === structureId);
  if (!structure) return;
  
  // Update position
  structure.x = newX;
  structure.y = newY;
  
  // Check if structure violates setbacks
  const violatesSetbacks = window.checkSetbackViolation(structure);
  
  // Update structure list item
  updateStructureListItem(structure, violatesSetbacks);
}

// Export functions for use in other modules
window.addStructureToList = addStructureToList;
window.updateStructureListItem = updateStructureListItem;
window.removeStructure = removeStructure;
window.editStructure = editStructure;
window.updateStructurePosition = updateStructurePosition;
