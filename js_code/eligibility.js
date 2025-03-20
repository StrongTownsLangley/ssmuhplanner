/**
 * SSMUH Planner - Eligibility Core Module
 * 
 * This module provides the core functionality for checking eligibility
 * and managing property data related to small-scale multi-unit housing.
 */

/**
 * Initialize the eligibility module
 */
function initEligibility() {
  // Set up event listeners
  document.getElementById('checkEligibility').addEventListener('click', checkEligibility);
  document.getElementById('isArterialRoad').addEventListener('change', toggleArterialWarning);
  
  // Initialize any default values
  updateLotInfo();
}

/**
 * Toggle the arterial road warning message based on checkbox state
 */
function toggleArterialWarning() {
  const isArterialRoad = document.getElementById('isArterialRoad').checked;
  const arterialWarning = document.getElementById('arterialWarning');
  if (arterialWarning) {
    arterialWarning.style.display = isArterialRoad ? 'block' : 'none';
  }
}

/**
 * Update form elements based on current application state
 */
function updateLotInfo() {
  // Update calculated fields if they exist
  const lotAreaSpan = document.getElementById('lotArea');
  if (lotAreaSpan && appState.lotAreaM2) {
    lotAreaSpan.textContent = appState.lotAreaM2.toFixed(1);
  }
  
  const maxUnitsSpan = document.getElementById('maxUnits');
  if (maxUnitsSpan && appState.maxUnits) {
    maxUnitsSpan.textContent = appState.maxUnits;
  }
  
  const maxCoverageSpan = document.getElementById('maxCoverage');
  if (maxCoverageSpan) {
    // Calculate max coverage based on zone type and other factors
    let maxCoverage = calculateMaxCoverage();
    maxCoverageSpan.textContent = maxCoverage;
  }
  
  const requiredParkingSpan = document.getElementById('requiredParking');
  if (requiredParkingSpan && appState.maxUnits) {
    const spacesPerUnit = ssmuhRules.parkingRequirements.residential.spacesPerDwellingUnit;
    const minSpaces = ssmuhRules.parkingRequirements.residential.minimumSpacesPerLot;
    requiredParkingSpan.textContent = Math.max(minSpaces, appState.maxUnits * spacesPerUnit);
  }
  
  const zoneNameSpan = document.getElementById('zoneName');
  if (zoneNameSpan && appState.zoneType) {
    let zoneName = appState.zoneType;
    
    // Set a more descriptive zone name if available
    if (appState.zoneType === 'R1A') {
      zoneName = 'R1A - Standard Residential';
    } else if (appState.zoneType.startsWith('R1')) {
      zoneName = appState.zoneType + ' - Residential';
    } else if (appState.zoneType === 'R2') {
      zoneName = 'R2 - Two-Family Residential';
    } else if (appState.zoneType === 'R-CL') {
      zoneName = 'R-CL - Residential Compact Lot';
    } else if (appState.zoneType.startsWith('SR')) {
      zoneName = appState.zoneType + ' - Suburban Residential';
    }
    
    zoneNameSpan.textContent = zoneName;
  }
}

/**
 * Calculate maximum building coverage based on zone and lot size
 * 
 * @return {number} Maximum building coverage percentage
 */
function calculateMaxCoverage() {
  // Default coverage
  let maxCoverage = ssmuhRules.lotCoverage.standard.maxCoverage;
  
  // Apply compact lot zone rules if applicable
  if (appState.zoneType === 'R-CL' || appState.zoneType === 'R-CLA' || 
      appState.zoneType === 'R-CLB' || appState.zoneType === 'R-CLCH') {
      
    if (appState.lotAreaM2 <= ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2) {
      // Small lot in compact lot zone
      maxCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.small.maxBuildingCoverage;
    } else {
      // Standard lot in compact lot zone
      maxCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.standard.maxBuildingCoverage;
    }
  }
  
  // Adjust coverage for infill housing if present
  if (appState.isInfillPresent) {
    if (appState.zoneType === 'R-CL' || appState.zoneType === 'R-CLA' || 
        appState.zoneType === 'R-CLB' || appState.zoneType === 'R-CLCH') {
      
      if (appState.lotAreaM2 > ssmuhRules.compactLotZones.lotAreaThresholds.small.maxAreaM2) {
        // Standard lot in compact lot zone with infill
        maxCoverage = ssmuhRules.compactLotZones.lotAreaThresholds.standard.withInfillHousingCoverage;
      }
    } else {
      // Standard zone with infill
      maxCoverage = ssmuhRules.lotCoverage.withInfillHousing.maxCoverage;
    }
  }
  
  return maxCoverage;
}

/**
 * Get the maximum number of allowed units based on lot size
 * 
 * @return {number} Maximum number of allowed units
 */
function calculateMaxUnits() {
  const eligibilityCriteria = ssmuhRules.smallScaleMultiUnitHousing.eligibilityCriteria;
  const smallLotThreshold = eligibilityCriteria.smallLotThresholdM2;
  
  if (appState.lotAreaM2 <= smallLotThreshold) {
    return eligibilityCriteria.maxUnitsIfSmallLot;
  } else {
    return eligibilityCriteria.maxUnits;
  }
}

/**
 * Get setbacks for a specific zone and loading type
 * 
 * @param {string} zoneType The zone type
 * @param {string} loadingType The loading type ('front' or 'rear')
 * @return {object} The setbacks for the specified zone and loading type
 */
function getSetbacksForZone(zoneType, loadingType) {
  const loadType = loadingType === 'front' ? 'frontLoadedLot' : 'rearLoadedLot';
  let setbacks = null;
  
  if (zoneType === 'R1A' && ssmuhRules.setbacks && ssmuhRules.setbacks.zoneR1A) {
    setbacks = ssmuhRules.setbacks.zoneR1A[loadType];
  } else if ((zoneType === 'R1B' || zoneType === 'R1C' || zoneType === 'R1D' || zoneType === 'R1E') && 
             ssmuhRules.setbacks && ssmuhRules.setbacks.residentialZones && 
             ssmuhRules.setbacks.residentialZones.R1B_R1C_R1D_R1E) {
    setbacks = ssmuhRules.setbacks.residentialZones.R1B_R1C_R1D_R1E[loadType];
  } else if (zoneType === 'R-CL' && ssmuhRules.setbacks && ssmuhRules.setbacks.residentialZones && 
             ssmuhRules.setbacks.residentialZones.compactLotR_CL) {
    setbacks = ssmuhRules.setbacks.residentialZones.compactLotR_CL[loadType];
  } else {
    // Default to R1A setbacks if specific zone not found
    setbacks = ssmuhRules.setbacks.zoneR1A[loadType];
  }
  
  // Return a copy of the setbacks object to avoid modifying the original
  return JSON.parse(JSON.stringify(setbacks));
}

/**
 * Get zone information for a specific zone type
 * 
 * @param {string} zoneType The zone type
 * @return {object} Zone information object
 */
function getZoneInfo(zoneType) {
  let zoneInfo = {};
  
  if (zoneType === 'R1A' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1A;
  } else if (zoneType.startsWith('R1') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    zoneInfo = ssmuhRules.zoningAreas.residentialZones.R1B_R1C_R1D_R1E;
  } else if (zoneType === 'R2' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    zoneInfo = ssmuhRules.zoningAreas.residentialZones.R2;
  } else if (zoneType === 'R-CL' && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.residentialZones) {
    zoneInfo = ssmuhRules.zoningAreas.residentialZones.R_CL;
  } else if (zoneType.startsWith('SR') && ssmuhRules.zoningAreas && ssmuhRules.zoningAreas.suburbanResidential) {
    zoneInfo = ssmuhRules.zoningAreas.suburbanResidential[zoneType];
  }
  
  return zoneInfo;
}

// Export functions and objects
window.appState = appState;
window.initEligibility = initEligibility;
window.getSetbacksForZone = getSetbacksForZone;
window.getZoneInfo = getZoneInfo;
window.calculateMaxCoverage = calculateMaxCoverage;
window.calculateMaxUnits = calculateMaxUnits;
window.updateLotInfo = updateLotInfo;