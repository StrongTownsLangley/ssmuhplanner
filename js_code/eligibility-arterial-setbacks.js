/**
 * SSMUH Planner - Arterial Road Setbacks Module
 * 
 * This module handles specific setbacks for properties on arterial or collector roads.
 */

/**
 * Get arterial road setbacks for a specific zone
 * 
 * @param {string} zoneType The zone type
 * @param {string} loadingType The loading type ('front' or 'rear')
 * @return {object} Arterial road setbacks for the specified zone
 */
function getArterialSetbacks(zoneType, loadingType) {
  const loadType = loadingType === 'front' ? 'frontLoadedLot' : 'rearLoadedLot';
  let arterialSetbacks = {};
  
  // Get base setbacks first
  let baseSetbacks = getSetbacksForZone(zoneType, loadingType);
  
  // Extract and enhance with arterial-specific setbacks
  if (zoneType === 'R1A' && ssmuhRules.setbacks && ssmuhRules.setbacks.zoneR1A) {
    if (baseSetbacks.principalBuilding && baseSetbacks.principalBuilding.sideCollectorOrArterialStreet) {
      arterialSetbacks.principalBuilding = {
        sideStreet: baseSetbacks.principalBuilding.sideCollectorOrArterialStreet.min
      };
    }
    
    if (baseSetbacks.accessoryDwellingUnit && baseSetbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet) {
      arterialSetbacks.accessoryDwellingUnit = {
        sideStreet: baseSetbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet.min
      };
    }
  } else if ((zoneType === 'R1B' || zoneType === 'R1C' || zoneType === 'R1D' || zoneType === 'R1E') && 
             ssmuhRules.setbacks && ssmuhRules.setbacks.residentialZones && 
             ssmuhRules.setbacks.residentialZones.R1B_R1C_R1D_R1E) {
    
    const setbacks = ssmuhRules.setbacks.residentialZones.R1B_R1C_R1D_R1E[loadType];
    
    if (setbacks.principalBuilding && setbacks.principalBuilding.sideCollectorOrArterialStreet) {
      arterialSetbacks.principalBuilding = {
        sideStreet: setbacks.principalBuilding.sideCollectorOrArterialStreet.min
      };
    }
    
    if (setbacks.accessoryStructure && setbacks.accessoryStructure.footprintOver6m2 && 
        setbacks.accessoryStructure.footprintOver6m2.sideCollectorOrArterialStreet) {
      arterialSetbacks.accessoryStructure = {
        sideStreet: setbacks.accessoryStructure.footprintOver6m2.sideCollectorOrArterialStreet.min
      };
    }
  } else if (zoneType === 'R-CL' && ssmuhRules.setbacks && ssmuhRules.setbacks.residentialZones && 
             ssmuhRules.setbacks.residentialZones.compactLotR_CL) {
    
    const setbacks = ssmuhRules.setbacks.residentialZones.compactLotR_CL[loadType];
    
    if (setbacks.principalBuilding && setbacks.principalBuilding.sideCollectorOrArterialStreet) {
      arterialSetbacks.principalBuilding = {
        sideStreet: setbacks.principalBuilding.sideCollectorOrArterialStreet.min
      };
    }
    
    if (loadType === 'rearLoadedLot' && setbacks.accessoryDetachedGarage && 
        setbacks.accessoryDetachedGarage.sideLaneOrCollectorOrArterialStreet) {
      arterialSetbacks.accessoryDetachedGarage = {
        sideStreet: setbacks.accessoryDetachedGarage.sideLaneOrCollectorOrArterialStreet.min
      };
    }
    
    if (setbacks.otherAccessoryStructure && setbacks.otherAccessoryStructure.sideCollectorOrArterialStreet) {
      arterialSetbacks.otherAccessoryStructure = {
        sideStreet: setbacks.otherAccessoryStructure.sideCollectorOrArterialStreet.min
      };
    }
  }
  
  // Get corner lot sight triangle information for arterial roads
  if (ssmuhRules.setbacks && ssmuhRules.setbacks.generalProvisions && 
      ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle) {
    
    const sightTriangle = ssmuhRules.setbacks.generalProvisions.cornerLotSightTriangle;
    
    if (sightTriangle.arterialOrCollectorStreet) {
      arterialSetbacks.cornerLotSightTriangle = {
        distance: sightTriangle.arterialOrCollectorStreet.distance,
        units: sightTriangle.arterialOrCollectorStreet.units
      };
    }
  }
  
  return arterialSetbacks;
}

/**
 * Apply arterial road setbacks to the existing setbacks in the application state
 */
function applyArterialSetbacks() {
  if (!appState.isArterialRoad) return;
  
  // Get arterial-specific setbacks
  const arterialSetbacks = getArterialSetbacks(appState.zoneType, appState.loadingType);
  
  // Apply principal building setbacks
  if (arterialSetbacks.principalBuilding && appState.setbacks.principalBuilding) {
    if (arterialSetbacks.principalBuilding.sideStreet) {
      // Create a side street setback property if not exists
      if (!appState.setbacks.principalBuilding.sideCollectorOrArterialStreet) {
        appState.setbacks.principalBuilding.sideCollectorOrArterialStreet = {};
      }
      
      // Update the setback value
      appState.setbacks.principalBuilding.sideCollectorOrArterialStreet.min = arterialSetbacks.principalBuilding.sideStreet;
    }
  }
  
  // Apply accessory building setbacks
  if (arterialSetbacks.accessoryDwellingUnit && appState.setbacks.accessoryDwellingUnit) {
    if (arterialSetbacks.accessoryDwellingUnit.sideStreet) {
      // Create a side street setback property if not exists
      if (!appState.setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet) {
        appState.setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet = {};
      }
      
      // Update the setback value
      appState.setbacks.accessoryDwellingUnit.sideCollectorOrArterialStreet.min = arterialSetbacks.accessoryDwellingUnit.sideStreet;
    }
  }
  
  // Store corner lot sight triangle info for arterial roads
  if (appState.isCornerLot && arterialSetbacks.cornerLotSightTriangle) {
    appState.cornerLotSightTriangle = arterialSetbacks.cornerLotSightTriangle;
  }
}

/**
 * Show arterial road warning if applicable
 */
function showArterialRoadWarning() {
  const arterialWarning = document.getElementById('arterialWarning');
  if (arterialWarning) {
    arterialWarning.style.display = appState.isArterialRoad ? 'block' : 'none';
  }
}

/**
 * Generate a summary of arterial road requirements
 * 
 * @return {string} HTML summary of arterial road requirements
 */
function generateArterialRoadSummary() {
  if (!appState.isArterialRoad) return '';
  
  let html = '<div class="mt-3 mb-3 p-3 border-left border-warning bg-light">';
  html += '<h5 class="text-warning"><i class="fas fa-exclamation-triangle"></i> Arterial Road Requirements</h5>';
  html += '<ul>';
  html += '<li>Board of Variance approval required for vehicular access</li>';
  html += '<li>Enhanced setbacks from arterial road required</li>';
  
  // Get arterial setbacks data
  const arterialSetbacks = getArterialSetbacks(appState.zoneType, appState.loadingType);
  
  // Principal building setback
  if (arterialSetbacks.principalBuilding && arterialSetbacks.principalBuilding.sideStreet) {
    html += `<li>Principal building must be set back ${arterialSetbacks.principalBuilding.sideStreet}m from arterial road</li>`;
  }
  
  // Accessory buildings setback
  if (arterialSetbacks.accessoryDwellingUnit && arterialSetbacks.accessoryDwellingUnit.sideStreet) {
    html += `<li>Accessory buildings must be set back ${arterialSetbacks.accessoryDwellingUnit.sideStreet}m from arterial road</li>`;
  }
  
  // Corner lot sight triangle
  if (appState.isCornerLot && arterialSetbacks.cornerLotSightTriangle && arterialSetbacks.cornerLotSightTriangle.distance) {
    html += `<li>Corner lot sight triangle: ${arterialSetbacks.cornerLotSightTriangle.distance}m from arterial road intersection</li>`;
  }
  
  html += '</ul>';
  html += '<p>Source: <a href="sources/2024-11-18 Council Meeting Minutes.pdf" target="_blank">November 18th 2025 Council Meeting Amendment</a></p>';
  html += '</div>';
  
  return html;
}

// Override updateAppStateFromForm function to include arterial road processing
const originalUpdateAppStateFromForm = updateAppStateFromForm;
window.updateAppStateFromForm = function() {
  // Call original function
  originalUpdateAppStateFromForm();
  
  // Apply arterial-specific setbacks
  applyArterialSetbacks();
};

// Export functions
window.getArterialSetbacks = getArterialSetbacks;
window.applyArterialSetbacks = applyArterialSetbacks;
window.showArterialRoadWarning = showArterialRoadWarning;
window.generateArterialRoadSummary = generateArterialRoadSummary;
