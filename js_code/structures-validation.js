/**
 * SSMUH Planner - Structure Validation
 * 
 * This module handles validation of structures against zoning requirements.
 */

/**
 * Check if a structure violates setback requirements
 * 
 * @param {object} structure The structure to check
 * @return {boolean} Whether the structure violates setbacks
 */
function checkSetbackViolation(structure) {
  const appState = window.ssmuhPlanner.appState;
  
  if (!appState.setbacks || !appState.setbacks.principalBuilding) {
    return false; // No setback data available
  }
  
  // Get relevant setback values based on structure type
  let relevantSetbacks;
  if (structure.type === 'accessory' || structure.type === 'coach') {
    relevantSetbacks = appState.setbacks.accessoryDwellingUnit || appState.setbacks.principalBuilding;
  } else if (structure.type === 'garage' && appState.setbacks.accessoryDetachedGarage) {
    relevantSetbacks = appState.setbacks.accessoryDetachedGarage;
  } else {
    relevantSetbacks = appState.setbacks.principalBuilding;
  }
  
  // Front setback
  let frontSetback = 0;
  if (relevantSetbacks.frontLotLine) {
    frontSetback = relevantSetbacks.frontLotLine.min;
  }
  
  if (structure.y < frontSetback) {
    return true;
  }
  
  // Rear setback
  let rearSetback = 0;
  if (relevantSetbacks.rearLotLine) {
    rearSetback = relevantSetbacks.rearLotLine.min;
  }
  
  if (structure.y + structure.depth > appState.lotDepth - rearSetback) {
    return true;
  }
  
  // Left side setback (interior)
  let sideSetback = 0;
  if (relevantSetbacks.sideInteriorLotLine) {
    sideSetback = relevantSetbacks.sideInteriorLotLine.min;
  } else if (relevantSetbacks.sideInteriorOrLaneOrLocalStreet) {
    sideSetback = relevantSetbacks.sideInteriorOrLaneOrLocalStreet.min;
  }
  
  if (structure.x < sideSetback) {
    return true;
  }
  
  // Right side setback (interior or street depending on corner lot)
  let rightSideSetback;
  if (appState.isCornerLot) {
    if (relevantSetbacks.sideCollectorOrArterialStreet) {
      rightSideSetback = relevantSetbacks.sideCollectorOrArterialStreet.min;
    } else {
      rightSideSetback = 3.0; // Default
    }
  } else {
    rightSideSetback = sideSetback;
  }
  
  if (structure.x + structure.width > appState.lotWidth - rightSideSetback) {
    return true;
  }
  
  // Check sight triangle if corner lot
  if (appState.isCornerLot && ssmuhRules.setbacks.generalProvisions && ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle) {
    const triangleSize = ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle.localStreetOrLane.distance;
    
    // Check if structure is in the lower right corner (sight triangle)
    const rightDistance = appState.lotWidth - (structure.x + structure.width);
    const bottomDistance = appState.lotDepth - (structure.y + structure.depth);
    
    if (rightDistance < triangleSize && bottomDistance < triangleSize) {
      // The structure is potentially in the sight triangle
      // Calculate exact triangle boundary at structure's position
      const triangleBoundaryX = appState.lotWidth - (triangleSize - bottomDistance);
      
      // If structure extends beyond the diagonal boundary of the triangle
      if (structure.x + structure.width > triangleBoundaryX) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Update lot statistics
 */
function updateLotStats() {
  // Get DOM elements
  const buildingCoverageSpan = document.getElementById('buildingCoverage');
  const maxCoverageSpan = document.getElementById('maxCoverage');
  const requiredParkingSpan = document.getElementById('requiredParking');
  const appState = window.ssmuhPlanner.appState;
  const structures = window.ssmuhStructures.structures;
  
  if (!buildingCoverageSpan || !maxCoverageSpan || !requiredParkingSpan) {
    return;
  }
  
  // Calculate total units and building area
  appState.totalUnits = structures.reduce((sum, s) => sum + s.units, 0);
  appState.totalBuildingArea = structures.reduce((sum, s) => sum + (s.width * s.depth), 0);
  //appState.isInfillPresent = structures.some(s => s.type === 'infill');
  
  // Calculate building coverage percentage
  const coveragePercent = appState.lotAreaM2 > 0 ? (appState.totalBuildingArea / appState.lotAreaM2) * 100 : 0;
  buildingCoverageSpan.textContent = coveragePercent.toFixed(1);
  
  // Get lot coverage data from JSON
  let maxCoverage = ssmuhRules.lotCoverage.standard.maxCoverage;
  
  if (appState.isInfillPresent) {
    maxCoverage = ssmuhRules.lotCoverage.withInfillHousing.maxCoverage;
  }
  
  // Apply compact lot zone rules if applicable
  if (appState.zoneType === 'R-CL' || appState.zoneType === 'R-CLA' || appState.zoneType === 'R-CLB' || appState.zoneType === 'R-CLCH') {
    if (appState.lotAreaM2 <= ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2) {
      maxCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.small.maxBuildingCoverage;
    } else {
      maxCoverage = appState.isInfillPresent ? 
                   ssmuhRules.compactLotZones.lotAreaThresholds.standard.withInfillHousingCoverage : 
                   ssmuhRules.compactLotZones.lotAreaThresholds.standard.maxBuildingCoverage;
    }
  }
  
  maxCoverageSpan.textContent = maxCoverage;
  
  // Required parking (minimum 2 spaces or 1 per unit, whichever is greater)
  const spacesPerUnit = ssmuhRules.parkingRequirements.residential.spacesPerDwellingUnit;
  const minSpaces = ssmuhRules.parkingRequirements.residential.minimumSpacesPerLot;
  requiredParkingSpan.textContent = Math.max(minSpaces, appState.totalUnits * spacesPerUnit);
  
  // Update lot stats visual feedback
  const maxUnitsSpan = document.getElementById('maxUnits');
  if (maxUnitsSpan) {
    if (appState.totalUnits > appState.maxUnits) {
      maxUnitsSpan.parentElement.classList.add('text-danger');
    } else {
      maxUnitsSpan.parentElement.classList.remove('text-danger');
    }
  }
  
  if (coveragePercent > parseInt(maxCoverageSpan.textContent)) {
    buildingCoverageSpan.parentElement.classList.add('text-danger');
  }
  else {
    buildingCoverageSpan.parentElement.classList.remove('text-danger');
  }
}

// Export functions for use in other modules
window.checkSetbackViolation = checkSetbackViolation;
window.updateLotStats = updateLotStats;
