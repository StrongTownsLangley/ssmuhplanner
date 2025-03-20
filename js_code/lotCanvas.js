/**
 * SSMUH Planner - Lot Canvas Module
 * 
 * This module handles the lot canvas visualization functionality.
 * 
 * - Draws the lot with proper dimensions
 * - Visualizes setbacks and restrictions
 * - Enables dragging and dropping structures
 * - Handles mobile touch interactions
 */

// Touch event variables for mobile support
let touchStartX = 0;
let touchStartY = 0;
let touchStructureId = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

/**
 * Initialize the lot canvas functionality
 */
function initializeLotCanvas() {
  // Set up structure button listeners
  if (typeof window.setupStructureListeners === 'function') {
    window.setupStructureListeners();
  }
  
  // Update Lot Information (from eligibility.js)
  updateLotInfo();

  // Render the canvas
  renderLotCanvas();
}

/**
 * Render the lot canvas
 */
function renderLotCanvas() {
  // Get references to DOM elements
  const lotCanvas = document.getElementById('lotCanvas');
  if (!lotCanvas) {
    // Canvas element doesn't exist yet, initialize it first
    initializeLotCanvas();
    return; // The initialization will call renderLotCanvas again
  }
  
  // Clear the canvas
  lotCanvas.innerHTML = '';
  
  // Set canvas scale (80% of canvas width/height)
  const canvasWidth = lotCanvas.offsetWidth;
  const canvasHeight = lotCanvas.offsetHeight;
  
  // Determine the scale factor (pixels per meter)
  const scaleX = canvasWidth * 0.8 / appState.lotWidth;
  const scaleY = canvasHeight * 0.8 / appState.lotDepth;
  const scale = Math.min(scaleX, scaleY);
  
  // Draw lot
  const lotDiv = document.createElement('div');
  lotDiv.style.position = 'absolute';
  lotDiv.style.left = (canvasWidth - appState.lotWidth * scale) / 2 + 'px';
  lotDiv.style.top = (canvasHeight - appState.lotDepth * scale) / 2 + 'px';
  lotDiv.style.width = appState.lotWidth * scale + 'px';
  lotDiv.style.height = appState.lotDepth * scale + 'px';
  lotDiv.style.border = '2px solid #333';
  lotDiv.style.backgroundColor = '#f8f9fa';
  lotCanvas.appendChild(lotDiv);
  
  // Draw street indicator
  const streetDiv = document.createElement('div');
  streetDiv.style.position = 'absolute';
  streetDiv.style.textAlign = 'center';
  streetDiv.style.fontWeight = 'bold';
  
  if (appState.loadingType === 'front') {
    streetDiv.style.left = lotDiv.style.left;
    streetDiv.style.top = parseInt(lotDiv.style.top) - 30 + 'px';
    streetDiv.style.width = lotDiv.style.width;
    streetDiv.textContent = 'Street';
  } else {
    streetDiv.style.left = lotDiv.style.left;
    streetDiv.style.top = parseInt(lotDiv.style.top) + parseInt(lotDiv.style.height) + 10 + 'px';
    streetDiv.style.width = lotDiv.style.width;
    streetDiv.textContent = 'Lane';
  }
  lotCanvas.appendChild(streetDiv);
  
  // For corner lots, add side street
  if (appState.isCornerLot) {
    const sideStreetDiv = document.createElement('div');
    sideStreetDiv.style.position = 'absolute';
    sideStreetDiv.style.textAlign = 'center';
    sideStreetDiv.style.fontWeight = 'bold';
    sideStreetDiv.style.transform = 'rotate(-90deg)';
    sideStreetDiv.style.transformOrigin = 'left bottom';
    sideStreetDiv.style.left = parseInt(lotDiv.style.left) + parseInt(lotDiv.style.width) + 30 + 'px';
    sideStreetDiv.style.top = parseInt(lotDiv.style.top) + parseInt(lotDiv.style.height) / 2 + 'px';
    sideStreetDiv.textContent = 'Side Street';
    lotCanvas.appendChild(sideStreetDiv);
  }
  
  // Draw setback zones if we have setback data
  if (appState.setbacks && appState.setbacks.principalBuilding) {
    drawSetbacks(lotDiv, scale);
  }
  
  // Draw existing structures
  const structures = window.ssmuhStructures.structures; // Get from global scope
  structures.forEach(structure => {
    renderStructure(structure, lotDiv, scale);
  });
  
  // Add setback legend
  addSetbackLegend(lotCanvas);
  
  // Update stats
  updateLotStats();

  // Make the lot canvas a drop target
  enableDragAndDrop(lotCanvas, lotDiv, scale);
}

/**
 * Enable drag and drop functionality on the lot canvas
 * 
 * @param {HTMLElement} lotCanvas The lot canvas element
 * @param {HTMLElement} lotDiv The lot div element
 * @param {number} scale The scale factor
 */
function enableDragAndDrop(lotCanvas, lotDiv, scale) {
  // Check if listeners are already attached
  if (lotCanvas.hasAttribute('data-listeners-attached')) {
    return; // Skip if already attached
  }
  
  // Make lot canvas a drop target
  lotCanvas.addEventListener('dragover', function(e) {
    e.preventDefault();
  });
  
  lotCanvas.addEventListener('drop', function(e) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const structureId = data.id;
      const offsetX = data.offsetX;
      const offsetY = data.offsetY;
      
      // Find the structure
      const structures = window.ssmuhStructures.structures;
      const structure = structures.find(s => s.id === structureId);
      if (!structure) return;
      
      // Get the current structure DIV to determine position relative to its parent
      const structureDiv = document.getElementById('structure-' + structureId);
      if (!structureDiv) return;
      
      // Get the parent lot DIV
      const lotDivElement = structureDiv.parentElement;
      if (!lotDivElement) return;
      
      // Get the rects
      const lotRect = lotDivElement.getBoundingClientRect();
      
      console.log("Found actual lotRect:", lotRect);
      
      // Calculate new position in meters
      const newX = (e.clientX - lotRect.left - offsetX) / scale;
      const newY = (e.clientY - lotRect.top - offsetY) / scale;
      
      // Constrain to lot boundaries
      structure.x = Math.max(0, Math.min(appState.lotWidth - structure.width, newX));
      structure.y = Math.max(0, Math.min(appState.lotDepth - structure.depth, newY));
      
      // Check for setback violation
      const violatesSetbacks = checkSetbackViolation(structure);
      
      // Update the structure list item to show setback violation status
      updateStructureListItem(structure, violatesSetbacks);
      
      renderLotCanvas();
    } catch (error) {
      console.error('Error in drop handler:', error);
    }
  });

  // Mark as attached
  lotCanvas.setAttribute('data-listeners-attached', 'true');
}

/**
 * Draw setbacks on the lot
 * 
 * @param {HTMLElement} lotDiv The lot div element
 * @param {number} scale The scale factor
 */
function drawSetbacks(lotDiv, scale) {
  // Get principal building setbacks
  const frontSetback = appState.setbacks.principalBuilding.frontLotLine.min;
  const rearSetback = appState.setbacks.principalBuilding.rearLotLine.min;
  let sideSetback;
  
  if (appState.setbacks.principalBuilding.sideInteriorLotLine) {
    sideSetback = appState.setbacks.principalBuilding.sideInteriorLotLine.min;
  } else if (appState.setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet) {
    sideSetback = appState.setbacks.principalBuilding.sideInteriorOrLaneOrLocalStreet.min;
  } else {
    sideSetback = 1.2; // Default
  }
  
  let sideStreetSetback;
  if (appState.setbacks.principalBuilding.sideCollectorOrArterialStreet) {
    sideStreetSetback = appState.setbacks.principalBuilding.sideCollectorOrArterialStreet.min;
  } else {
    sideStreetSetback = 3.0; // Default
  }
  
  // Create setback zones (using absolute positioning relative to lot)
  
  // Front setback zone
  const frontSetbackZone = document.createElement('div');
  frontSetbackZone.className = 'setback-zone front-setback';
  frontSetbackZone.style.position = 'absolute';
  frontSetbackZone.style.left = '0';
  frontSetbackZone.style.top = '0';
  frontSetbackZone.style.width = '100%';
  frontSetbackZone.style.height = frontSetback * scale + 'px';
  frontSetbackZone.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  frontSetbackZone.style.borderBottom = '1px dashed #f00';
  frontSetbackZone.title = `Front Setback: ${frontSetback}m`;
  
  // Rear setback zone
  const rearSetbackZone = document.createElement('div');
  rearSetbackZone.className = 'setback-zone rear-setback';
  rearSetbackZone.style.position = 'absolute';
  rearSetbackZone.style.left = '0';
  rearSetbackZone.style.bottom = '0';
  rearSetbackZone.style.width = '100%';
  rearSetbackZone.style.height = rearSetback * scale + 'px';
  rearSetbackZone.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  rearSetbackZone.style.borderTop = '1px dashed #f00';
  rearSetbackZone.title = `Rear Setback: ${rearSetback}m`;
  
  // Left side setback zone
  const leftSetbackZone = document.createElement('div');
  leftSetbackZone.className = 'setback-zone left-setback';
  leftSetbackZone.style.position = 'absolute';
  leftSetbackZone.style.left = '0';
  leftSetbackZone.style.top = frontSetback * scale + 'px';
  leftSetbackZone.style.width = sideSetback * scale + 'px';
  leftSetbackZone.style.height = (appState.lotDepth - frontSetback - rearSetback) * scale + 'px';
  leftSetbackZone.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  leftSetbackZone.style.borderRight = '1px dashed #f00';
  leftSetbackZone.title = `Side Setback: ${sideSetback}m`;
  
  // Right side setback zone (different if corner lot)
  const rightSetbackZone = document.createElement('div');
  rightSetbackZone.className = 'setback-zone right-setback';
  rightSetbackZone.style.position = 'absolute';
  rightSetbackZone.style.right = '0';
  rightSetbackZone.style.top = frontSetback * scale + 'px';
  const rightSetbackWidth = appState.isCornerLot ? sideStreetSetback : sideSetback;
  rightSetbackZone.style.width = rightSetbackWidth * scale + 'px';
  rightSetbackZone.style.height = (appState.lotDepth - frontSetback - rearSetback) * scale + 'px';
  rightSetbackZone.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  rightSetbackZone.style.borderLeft = '1px dashed #f00';
  rightSetbackZone.title = appState.isCornerLot ? `Side Street Setback: ${rightSetbackWidth}m` : `Side Setback: ${rightSetbackWidth}m`;
  
  // Add to lot
  lotDiv.appendChild(frontSetbackZone);
  lotDiv.appendChild(rearSetbackZone);
  lotDiv.appendChild(leftSetbackZone);
  lotDiv.appendChild(rightSetbackZone);
  
  // Add sight triangle for corner lots if applicable
  if (appState.isCornerLot && ssmuhRules.setbacks.generalProvisions && ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle) {
    const triangleSize = ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.localStreetOrLane.distance;
    
    // Create sight triangle
    const sightTriangle = document.createElement('div');
    sightTriangle.className = 'setback-zone sight-triangle';
    sightTriangle.style.position = 'absolute';
    sightTriangle.style.right = '0';
    sightTriangle.style.bottom = '0';
    sightTriangle.style.width = triangleSize * scale + 'px';
    sightTriangle.style.height = triangleSize * scale + 'px';
    sightTriangle.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';
    sightTriangle.style.borderTop = '1px dashed orange';
    sightTriangle.style.borderLeft = '1px dashed orange';
    sightTriangle.style.clipPath = 'polygon(100% 0%, 100% 100%, 0% 100%)';
    sightTriangle.title = `Sight Triangle: ${triangleSize}m`;
    
    lotDiv.appendChild(sightTriangle);
    
    // Add sight triangle label
    addSetbackLabel(lotDiv, 'Sight Triangle', 
      (appState.lotWidth * scale - triangleSize * scale / 2) + 'px', 
      (appState.lotDepth * scale - triangleSize * scale / 2) + 'px');
  }
  
  // Add setback labels
  addSetbackLabel(lotDiv, 'Front: ' + frontSetback + 'm', '50%', frontSetback * scale / 2 + 'px');
  addSetbackLabel(lotDiv, 'Rear: ' + rearSetback + 'm', '50%', (appState.lotDepth * scale - rearSetback * scale / 2) + 'px');
  addSetbackLabel(lotDiv, 'Side: ' + sideSetback + 'm', sideSetback * scale / 2 + 'px', '50%', 'vertical');
  
  const rightLabel = appState.isCornerLot ? `Side St: ${rightSetbackWidth}m` : `Side: ${rightSetbackWidth}m`;
  addSetbackLabel(lotDiv, rightLabel, (appState.lotWidth * scale - rightSetbackWidth * scale / 2) + 'px', '50%', 'vertical');
}

/**
 * Add setback label to the lot
 * 
 * @param {HTMLElement} lotDiv The lot div element
 * @param {string} text The label text
 * @param {string} left The left position (CSS value)
 * @param {string} top The top position (CSS value)
 * @param {string} orientation The orientation ('horizontal' or 'vertical')
 */
function addSetbackLabel(lotDiv, text, left, top, orientation = 'horizontal') {
  const label = document.createElement('div');
  label.className = 'setback-label';
  label.textContent = text;
  label.style.position = 'absolute';
  label.style.left = left;
  label.style.top = top;
  label.style.transform = orientation === 'vertical' ? 
                          'translate(-50%, -50%) rotate(90deg)' : 
                          'translate(-50%, -50%)';
  label.style.fontSize = '10px';
  label.style.color = '#f00';
  label.style.whiteSpace = 'nowrap';
  label.style.pointerEvents = 'none';
  lotDiv.appendChild(label);
}

/**
 * Add a setback legend to the canvas
 * 
 * @param {HTMLElement} canvas The canvas element
 */
function addSetbackLegend(canvas) {
  const legend = document.createElement('div');
  legend.className = 'setback-legend';
  legend.style.position = 'absolute';
  legend.style.right = '10px';
  legend.style.top = '10px';
  legend.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  legend.style.padding = '5px';
  legend.style.border = '1px solid #ccc';
  legend.style.borderRadius = '4px';
  legend.style.fontSize = '12px';
  legend.style.zIndex = '1000';
  
  let legendContent = `
    <div style="margin-bottom: 5px; font-weight: bold;">Legend:</div>
    <div style="display: flex; align-items: center; margin-bottom: 3px;">
      <div style="width: 15px; height: 15px; background-color: rgba(255, 0, 0, 0.1); border: 1px dashed #f00; margin-right: 5px;"></div>
      <span>Setback Zones</span>
    </div>
  `;
  
  if (appState.isCornerLot) {
    legendContent += `
      <div style="display: flex; align-items: center; margin-bottom: 3px;">
        <div style="width: 15px; height: 15px; background-color: rgba(255, 165, 0, 0.2); border: 1px dashed orange; margin-right: 5px;"></div>
        <span>Sight Triangle</span>
      </div>
    `;
  }
  
  legend.innerHTML = legendContent;
  canvas.appendChild(legend);
}

/**
 * Render a structure on the canvas
 * 
 * @param {object} structure The structure object
 * @param {HTMLElement} lotDiv The lot div element
 * @param {number} scale The scale factor
 */
function renderStructure(structure, lotDiv, scale) {
  console.log('Rendering structure:', {
    id: structure.id,
    x: structure.x,
    y: structure.y,
    scaledX: structure.x * scale,
    scaledY: structure.y * scale,
    width: structure.width,
    height: structure.depth
  });
  const structureDiv = document.createElement('div');
  structureDiv.id = 'structure-' + structure.id;
  structureDiv.style.position = 'absolute';
  structureDiv.style.left = structure.x * scale + 'px';
  structureDiv.style.top = structure.y * scale + 'px';
  structureDiv.style.width = structure.width * scale + 'px';
  structureDiv.style.height = structure.depth * scale + 'px';
  structureDiv.style.backgroundColor = getStructureColor(structure.type);
  structureDiv.style.border = '1px solid #333';
  structureDiv.style.cursor = 'move';
  structureDiv.style.display = 'flex';
  structureDiv.style.justifyContent = 'center';
  structureDiv.style.alignItems = 'center';
  structureDiv.style.color = '#fff';
  structureDiv.style.fontSize = '12px';
  structureDiv.style.textAlign = 'center';
  structureDiv.innerHTML = `${structure.type}<br>${structure.units} unit(s)<br>${structure.stories} ${structure.stories > 1 ? 'stories' : 'story'}`;
  
  // Check if structure violates setbacks
  const isViolatingSetbacks = checkSetbackViolation(structure);
  if (isViolatingSetbacks) {
    structureDiv.style.border = '2px solid red';
    structureDiv.style.boxShadow = '0 0 8px rgba(255, 0, 0, 0.5)';
    
    // Add warning icon
    const warningIcon = document.createElement('div');
    warningIcon.style.position = 'absolute';
    warningIcon.style.top = '-15px';
    warningIcon.style.right = '-15px';
    warningIcon.style.width = '24px';
    warningIcon.style.height = '24px';
    warningIcon.style.borderRadius = '50%';
    warningIcon.style.backgroundColor = 'red';
    warningIcon.style.color = 'white';
    warningIcon.style.display = 'flex';
    warningIcon.style.justifyContent = 'center';
    warningIcon.style.alignItems = 'center';
    warningIcon.style.fontSize = '16px';
    warningIcon.style.fontWeight = 'bold';
    warningIcon.textContent = '!';
    warningIcon.title = 'Structure violates setback requirements';
    structureDiv.appendChild(warningIcon);
  }
  
  // Make draggable
  structureDiv.draggable = true;
  structureDiv.addEventListener('dragstart', function(e) {
    const rect = structureDiv.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    console.log('Drag start:', {
      structureId: structure.id,
      clientX: e.clientX,
      clientY: e.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      offsetX: offsetX,
      offsetY: offsetY
    });

    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: structure.id,
      offsetX: offsetX,
      offsetY: offsetY
    }));
  });
  
  // Add touch support for mobile
  structureDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
  structureDiv.addEventListener('touchmove', handleTouchMove, { passive: false });
  structureDiv.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  lotDiv.appendChild(structureDiv);
}

/**
 * Get structure color based on type 
 * Use the function from the global scope if available
 *
 * @param {string} type The structure type
 * @returns {string} The color
 */
function getStructureColor(type) {
  // Use the function from window.ssmuhStructures if available
  if (window.ssmuhStructures && typeof window.ssmuhStructures.getStructureColor === 'function') {
    return window.ssmuhStructures.getStructureColor(type);
  }
  
  // Otherwise use default color scheme
  switch(type) {
    case 'principal': return '#007bff';
    case 'secondary': return '#6610f2';
    case 'infill': return '#6f42c1';
    case 'accessory': return '#e83e8c';
    case 'coach': return '#dc3545';
    case 'garage': return '#fd7e14';
    default: return '#6c757d';
  }
}

/**
 * Handle touch start event for mobile drag and drop
 * 
 * @param {TouchEvent} e The touch event
 */
function handleTouchStart(e) {
  e.preventDefault();
  
  const touch = e.touches[0];
  const structureDiv = this;
  const structureId = parseInt(structureDiv.id.replace('structure-', ''));
  
  const rect = structureDiv.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStructureId = structureId;
}

/**
 * Handle touch move event for mobile drag and drop
 * 
 * @param {TouchEvent} e The touch event
 */
function handleTouchMove(e) {
  if (touchStructureId === null) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const structureDiv = document.getElementById('structure-' + touchStructureId);
  if (!structureDiv) return;
  
  const lotDiv = structureDiv.parentElement;
  if (!lotDiv) return;
  
  const lotRect = lotDiv.getBoundingClientRect();
  const canvas = lotDiv.parentElement;
  const canvasRect = canvas.getBoundingClientRect();
  
  // Calculate scale
  const scale = appState.lotWidth > 0 ? 
                parseFloat(lotDiv.style.width) / appState.lotWidth : 
                1;
  
  // Calculate new position in metres
  const newX = (touch.clientX - lotRect.left - touchOffsetX) / scale;
  const newY = (touch.clientY - lotRect.top - touchOffsetY) / scale;
  
  // Move the structure (update style for visual feedback)
  structureDiv.style.left = (newX * scale) + 'px';
  structureDiv.style.top = (newY * scale) + 'px';
}

/**
 * Handle touch end event for mobile drag and drop
 * 
 * @param {TouchEvent} e The touch event
 */
function handleTouchEnd(e) {
  if (touchStructureId === null) return;
  e.preventDefault();
  
  const structureDiv = document.getElementById('structure-' + touchStructureId);
  if (!structureDiv) {
    touchStructureId = null;
    return;
  }
  
  const lotDiv = structureDiv.parentElement;
  if (!lotDiv) {
    touchStructureId = null;
    return;
  }
  
  // Calculate scale
  const scale = appState.lotWidth > 0 ? 
                parseFloat(lotDiv.style.width) / appState.lotWidth : 
                1;
  
  // Get current position
  const currentX = parseFloat(structureDiv.style.left) / scale;
  const currentY = parseFloat(structureDiv.style.top) / scale;
  
  // Find the structure
  const structures = window.ssmuhStructures.structures;
  const structure = structures.find(s => s.id === touchStructureId);
  if (structure) {
    // Update structure position
    structure.x = currentX;
    structure.y = currentY;
    
    // Check if structure violates setbacks
    const violatesSetbacks = checkSetbackViolation(structure);
    
    // Update structure list item
    updateStructureListItem(structure, violatesSetbacks);
  }
  
  // Reset touch variables
  touchStructureId = null;
  
  // Re-render lot canvas to update everything
  renderLotCanvas();
}

// Export functions for use in other modules
window.initializeLotCanvas = initializeLotCanvas;
window.renderLotCanvas = renderLotCanvas;